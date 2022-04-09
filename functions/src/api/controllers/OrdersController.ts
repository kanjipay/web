import BaseController from "./BaseController";
import { ErrorHandler, HttpError, HttpStatusCode } from "../../utils/errors";
import { sendEmail } from "../emails";
import { db } from "../../utils/admin";
import Collection from "../../enums/Collection";
import OrderStatus from "../../enums/OrderStatus";
import MerchantStatus from "../../enums/MerchantStatus";
import LoggingController from "../../utils/loggingClient";

export default class OrdersController extends BaseController {
  sendEmailReceipt = async (req, res, next) => {
    const { email, orderId } = req.body;

    await sendEmail(email, orderId).catch(
      new ErrorHandler(HttpStatusCode.INTERNAL_SERVER_ERROR, next).handle
    );

    await db()
      .collection(Collection.ORDER)
      .doc(orderId)
      .set({ receiptSent: true }, { merge: true })
      .catch(
        new ErrorHandler(HttpStatusCode.INTERNAL_SERVER_ERROR, next).handle
      );

    return res.sendStatus(200);
  };

  create = async (req, res, next) => {
    const { requestedItems, merchantId, deviceId } = req.body;

    const loggingClient = new LoggingController("Order Controller");
    loggingClient.log("Order creation started", 
    {      environment: process.env.ENVIRONMENT,
      clientURL: process.env.CLIENT_URL,
    }, {      requestedItems: requestedItems,
      merchantId: merchantId,
      deviceId: deviceId,});




    // const correlationId = uuid();

    // functions.logger.log("Create Order API Invoked", {
    //   correlationId: correlationId,
    //   requestedItems: requestedItems,
    //   merchantId: merchantId,
    //   deviceId: deviceId,
    //   environment: process.env.ENVIRONMENT,
    //   clientURL: process.env.CLIENT_URL,
    // });

    // Check merchantId exists and is open
    const merchantDoc = await db()
      .collection(Collection.MERCHANT)
      .doc(merchantId)
      .get()
      .catch(
        new ErrorHandler(HttpStatusCode.INTERNAL_SERVER_ERROR, next).handle
      );

    if (!merchantDoc) {
      loggingClient.warn("Order creation attempted for non-existent merchant");
      next(
        new HttpError(HttpStatusCode.NOT_FOUND, "That merchant doesn't exist")
      );
      return;
    }

    const merchant = { id: merchantDoc.id, status: merchantDoc.data().status };

    if (merchant.status !== MerchantStatus.OPEN) {
      loggingClient.log("Order creation attempted for closed merchant");
      next(
        new HttpError(
          HttpStatusCode.BAD_REQUEST,
          "Sorry, the merchant isn't open at the moment"
        )
      );
      return;
    }

    const requestedMenuItemIds = requestedItems.map((item) => item.id);
    const menuItemsSnapshot = await db()
      .collection(Collection.MENU_ITEM)
      .where("__name__", "in", requestedMenuItemIds)
      .where("merchantId", "==", merchantId)
      .get();
    // .catch(new ErrorHandler(HttpStatusCode.INTERNAL_SERVER_ERROR, next).handle)

  loggingClient.log("Menu items retreived");

    const menuItems = menuItemsSnapshot.docs.map((item) => {
      const { isAvailable, price, title, photo } = item.data();
      return {
        id: item.id,
        isAvailable,
        price,
        title,
        photo,
      };
    });

    const menuItemIds = menuItems.map((item) => item.id);
    const unavailableItemIds = menuItems
      .filter((item) => !item.isAvailable)
      .map((item) => item.id);

    const nonexistantMenuItemTitles = requestedItems
      .filter((item) => !menuItemIds.includes(item.id))
      .map((item) => item.title);

    const unavailableMenuItemTitles = requestedItems
      .filter((item) => unavailableItemIds.includes(item.id))
      .map((item) => item.title);

    if (nonexistantMenuItemTitles.length > 0) {
      const isPlural = nonexistantMenuItemTitles.length > 1;
      const clientMessage = `We couldn't find the following item${
        isPlural ? "s" : ""
      } on the menu: ${nonexistantMenuItemTitles.join(
        ", "
      )}. Please remove from your basket to continue.`;
      loggingClient.error("Non existent menu items requested in order", 
        {nonexistantMenuItemTitles});
      next(new HttpError(HttpStatusCode.BAD_REQUEST, clientMessage));
      return;
    }

    if (unavailableMenuItemTitles.length > 0) {
      const isPlural = unavailableMenuItemTitles.length > 1;
      const clientMessage = `The following item${
        isPlural ? "s are" : " is"
      } currently unavailable: ${unavailableMenuItemTitles.join(
        ", "
      )}. Please remove from your basket to continue.`;
      loggingClient.warn("Unavailable menu items requested in order", 
      {unavailableMenuItemTitles});
      next(new HttpError(HttpStatusCode.BAD_REQUEST, clientMessage));
      return;
    }

    const prices = menuItems.reduce((obj, item) => {
      obj[item.id] = item.price;
      return obj;
    }, {});

    const total = requestedItems.reduce((currTotal, item) => {
      const price = prices[item.id] || 0;
      return currTotal + item.quantity * price;
    }, 0);

    const startOfToday = new Date();
    startOfToday.setUTCHours(0, 0, 0, 0);

    const latestOrdersSnap = await db()
      .collection(Collection.ORDER)
      .where("merchantId", "==", merchantId)
      .where("createdAt", ">=", startOfToday)
      .orderBy("createdAt", "desc")
      .limit(1)
      .get();
    // .catch(new ErrorHandler(HttpStatusCode.INTERNAL_SERVER_ERROR, next).handle)

    let orderNumber;

    const latestOrders = latestOrdersSnap.docs.map((doc) => ({
      id: doc.id,
      orderNumber: doc.data().orderNumber,
    }));

    if (latestOrders.length > 0) {
      const latestOrderNumber = latestOrders[0].orderNumber || 1;
      orderNumber = latestOrderNumber + 1;
    } else {
      orderNumber = 1;
    }
    loggingClient.log("Order number set", {}, {orderNumber});

    const orderRef = await db()
      .collection(Collection.ORDER)
      .add({
        createdAt: new Date(),
        status: OrderStatus.PENDING,
        total,
        deviceId,
        merchantId,
        receiptSent: false,
        orderNumber,
        orderItems: requestedItems.map((item) => {
          const menuItem = menuItems.find(
            (menuItem) => menuItem.id === item.id
          );

          const { title, photo, price } = menuItem;

          return {
            menuItemId: item.id,
            quantity: item.quantity,
            title,
            photo,
            price,
          };
        }),
      });

    const orderId = orderRef.id;

    loggingClient.log("Order document creation complete", {}, {orderId});

    // Having created the order, need to create a subcollection containing the order items
    const batch = db().batch();

    for (const item of requestedItems) {
      const menuItem = menuItems.find((menuItem) => menuItem.id === item.id);
      const { title, photo, price } = menuItem;

      batch.set(db().doc(orderRef.path).collection("OrderItem").doc(), {
        orderId,
        menuItemId: item.id,
        quantity: item.quantity,
        title,
        photo,
        price,
      });
    }

    await batch.commit();

    loggingClient.log("Order subcollection creation complete");

    return res.status(200).json({ orderId });
  };
}
