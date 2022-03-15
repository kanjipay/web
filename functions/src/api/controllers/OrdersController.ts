import BaseController from "./BaseController";
import { ErrorHandler, HttpError, HttpStatusCode } from "../../utils/errors";
import { sendEmail } from "../emails";
import { db } from "../../admin";
import Collection from "../../enums/Collection";
import OrderStatus from "../../enums/OrderStatus";
import MerchantStatus from "../../enums/MerchantStatus";

export default class OrdersController extends BaseController {
  sendEmailReceipt = async (req, res, next) => {
    const { email, order_id } = req.body;
    await sendEmail(email, order_id).catch(
      new ErrorHandler(HttpStatusCode.INTERNAL_SERVER_ERROR, next).handle
    );
    return res.sendStatus(200);
  };

  create = async (req, res, next) => {
    const { requested_items, merchant_id, device_id } = req.body;

    // Check merchant_id exists and is open
    const merchantDoc = await db
      .collection(Collection.MERCHANT)
      .doc(merchant_id)
      .get()
      .catch(
        new ErrorHandler(HttpStatusCode.INTERNAL_SERVER_ERROR, next).handle
      );

    if (!merchantDoc) {
      next(
        new HttpError(HttpStatusCode.NOT_FOUND, "That merchant doesn't exist")
      );
      return;
    }

    const merchant = { id: merchantDoc.id, status: merchantDoc.data().status };

    if (merchant.status !== MerchantStatus.OPEN) {
      next(
        new HttpError(
          HttpStatusCode.BAD_REQUEST,
          "Sorry, the merchant isn't open at the moment"
        )
      );
      return;
    }

    const requestedMenuItemIds = requested_items.map((item) => item.id);
    const menuItemsSnapshot = await db
      .collection(Collection.MENU_ITEM)
      .where("__name__", "in", requestedMenuItemIds)
      .where("merchant_id", "==", merchant_id)
      .get();
    // .catch(new ErrorHandler(HttpStatusCode.INTERNAL_SERVER_ERROR, next).handle)

    const menuItems = menuItemsSnapshot.docs.map((item) => {
      const { is_available, price, title, photo } = item.data();
      return {
        id: item.id,
        is_available,
        price,
        title,
        photo,
      };
    });

    const menuItemIds = menuItems.map((item) => item.id);
    const unavailableItemIds = menuItems
      .filter((item) => !item.is_available)
      .map((item) => item.id);

    const nonexistantMenuItemTitles = requested_items
      .filter((item) => !menuItemIds.includes(item.id))
      .map((item) => item.title);

    const unavailableMenuItemTitles = requested_items
      .filter((item) => unavailableItemIds.includes(item.id))
      .map((item) => item.title);

    if (nonexistantMenuItemTitles.length > 0) {
      const isPlural = nonexistantMenuItemTitles.length > 1;
      const clientMessage = `We couldn't find the following item${
        isPlural ? "s" : ""
      } on the menu: ${nonexistantMenuItemTitles.join(
        ", "
      )}. Please remove from your basket to continue.`;
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
      next(new HttpError(HttpStatusCode.BAD_REQUEST, clientMessage));
      return;
    }

    const prices = menuItems.reduce((obj, item) => {
      obj[item.id] = item.price;
      return obj;
    }, {});

    const total = requested_items.reduce((currTotal, item) => {
      const price = prices[item.id] || 0;
      return currTotal + item.quantity * price;
    }, 0);

    const startOfToday = new Date();
    startOfToday.setUTCHours(0, 0, 0, 0);

    const latestOrdersSnap = await db
      .collection(Collection.ORDER)
      .where("merchant_id", "==", merchant_id)
      .where("created_at", ">=", startOfToday)
      .orderBy("created_at", "desc")
      .limit(1)
      .get();
    // .catch(new ErrorHandler(HttpStatusCode.INTERNAL_SERVER_ERROR, next).handle)

    let orderNumber;

    const latestOrders = latestOrdersSnap.docs.map((doc) => ({
      id: doc.id,
      order_number: doc.data().order_number,
    }));

    if (latestOrders.length > 0) {
      const latestOrderNumber = latestOrders[0].order_number || 1;
      orderNumber = latestOrderNumber + 1;
    } else {
      orderNumber = 1;
    }

    const orderRef = await db.collection(Collection.ORDER).add({
      created_at: new Date(),
      status: OrderStatus.PENDING,
      total,
      device_id,
      merchant_id,
      receipt_sent: false,
      order_number: orderNumber,
      order_items: requested_items.map((item) => {
        const menuItem = menuItems.find((menuItem) => menuItem.id === item.id);

        return {
          menu_item_id: item.id,
          quantity: item.quantity,
          title: menuItem.title,
          photo: menuItem.photo,
          price: menuItem.price,
        };
      }),
    });

    const orderId = orderRef.id;

    // Having created the order, need to create a subcollection containing the order items
    const batch = db.batch();

    for (const item of requested_items) {
      const menuItem = menuItems.find((menuItem) => menuItem.id === item.id);

      batch.set(db.doc(orderRef.path).collection("OrderItem").doc(), {
        order_id: orderId,
        menu_item_id: item.id,
        quantity: item.quantity,
        title: menuItem.title,
        photo: menuItem.photo,
        price: menuItem.price,
      });
    }

    await batch.commit();

    return res.status(200).json({ order_id: orderId });
  };
}
