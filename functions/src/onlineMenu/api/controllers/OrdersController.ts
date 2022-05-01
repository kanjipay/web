import BaseController from "../../../shared/BaseController";
import { ErrorHandler, HttpError, HttpStatusCode } from "../../../shared/utils/errors";
import { sendEmail } from "../../../internal/emails";
import { db } from "../../../shared/utils/admin";
import Collection from "../../../shared/enums/Collection";
import OrderStatus from "../../../shared/enums/OrderStatus";
import MerchantStatus from "../../../shared/enums/MerchantStatus";
import LoggingController from "../../../shared/utils/loggingClient";
import { fetchDocument } from "../../../shared/utils/fetchDocument";
import { createMercadoPaymentIntent } from "../../utils/mercadoClient";
import { firestore } from "firebase-admin";

export default class OrdersController extends BaseController {
  private async fetchMenuItems(requestedItems: { id: string, quantity: number, title: string }[], merchantId: string) {
    const requestedMenuItemIds = requestedItems.map(item => item.id);

    const menuItemsSnapshot = await db()
      .collection(Collection.MENU_ITEM)
      .where(firestore.FieldPath.documentId(), "in", requestedMenuItemIds)
      .where("merchantId", "==", merchantId)
      .get();

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

    return menuItems
  }

  private checkMenuItemsForErrors(requestedItems: { id: string, quantity: number, title: string }[], menuItems): HttpError | null {
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
      const errorMessage = `We couldn't find the following item${isPlural ? "s" : ""
        } on the menu: ${nonexistantMenuItemTitles.join(
          ", "
        )}. Please remove from your basket to continue.`;
      return new HttpError(HttpStatusCode.BAD_REQUEST, errorMessage, errorMessage)
    }

    if (unavailableMenuItemTitles.length > 0) {
      const isPlural = unavailableMenuItemTitles.length > 1;
      const errorMessage = `The following item${isPlural ? "s are" : " is"
        } currently unavailable: ${unavailableMenuItemTitles.join(
          ", "
        )}. Please remove from your basket to continue.`;
      return new HttpError(HttpStatusCode.BAD_REQUEST, errorMessage, errorMessage)
    }

    return null
  }

  private calculateOrderTotal(requestedItems: { id: string, quantity: number, title: string }[], menuItems): number {
    const prices = menuItems.reduce((obj, item) => {
      obj[item.id] = item.price;
      return obj;
    }, {});

    const total = requestedItems.reduce((currTotal, item) => {
      const price = prices[item.id] || 0;
      return currTotal + item.quantity * price;
    }, 0);

    return total
  }

  private async generateOrderNumber(merchantId: string, loggingClient: LoggingController): Promise<number> {
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

    loggingClient.log("Order number set", {}, { orderNumber });

    return orderNumber
  }

  private generateOrderItems(requestedItems: { id: string, quantity: number, title: string }[], menuItems): { 
    menuItemId: string, 
    quantity: number, 
    title: string, 
    photo: string, 
    price: number
  }[] {
    return requestedItems.map((item) => {
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
    })
  }

  private async createOrderItems(orderId, orderItems) {
    // Having created the order, need to create a subcollection containing the order items
    const batch = db().batch();

    for (const item of orderItems) {
      const orderItemRef = db()
        .collection(Collection.ORDER)
        .doc(orderId)
        .collection("OrderItem")
        .doc()

      batch.set(orderItemRef, {
        orderId,
        ...item
      });
    }

    await batch.commit();
  }

  create = async (req, res, next) => {
    const { requestedItems, merchantId, deviceId, userId } = req.body;

    const loggingClient = new LoggingController("Order Controller");
    loggingClient.log(
      "Order creation started",
      {
        environment: process.env.ENVIRONMENT,
        clientURL: process.env.CLIENT_URL,
      },
      {
        requestedItems,
        merchantId,
        deviceId,
      }
    );

    const { merchant, merchantError } = await fetchDocument(Collection.MERCHANT, merchantId, { status: MerchantStatus.OPEN})
    const { payeeId } = merchant

    if (merchantError) {
      next(merchantError)
      return
    }

    const menuItems = await this.fetchMenuItems(requestedItems, merchantId)
    const menuItemError = this.checkMenuItemsForErrors(requestedItems, menuItems)

    if (menuItemError) {
      next(menuItemError)
      return
    }

    const total = this.calculateOrderTotal(requestedItems, menuItems)
    const orderItems = this.generateOrderItems(requestedItems, menuItems)
    const orderNumber = await this.generateOrderNumber(merchantId, loggingClient)
    const { paymentIntentId, checkoutUrl } = await createMercadoPaymentIntent(total, payeeId)

    const orderRef = await db()
      .collection(Collection.ORDER)
      .add({
        createdAt: firestore.FieldValue.serverTimestamp(),
        status: OrderStatus.PENDING,
        mercado: {
          paymentIntentId
        },
        total,
        deviceId,
        userId,
        merchantId,
        receiptSent: false,
        orderNumber,
        orderItems
      });

    const orderId = orderRef.id;

    loggingClient.log("Order document creation complete", {}, { orderId });

    await this.createOrderItems(orderId, orderItems)

    loggingClient.log("Order subcollection creation complete");

    return res.status(200).json({ checkoutUrl, orderId });
  };

  sendEmailReceipt = async (req, res, next) => {
    const { email, orderId } = req.body;

    const { orderError } = await fetchDocument(Collection.ORDER, orderId, { receiptSent: false })

    if (orderError) {
      next(orderError)
      return
    }

    await sendEmail(email, orderId).catch(
      new ErrorHandler(HttpStatusCode.INTERNAL_SERVER_ERROR, next).handle
    );

    await db()
      .collection(Collection.ORDER)
      .doc(orderId)
      .update({ receiptSent: true })
      .catch(
        new ErrorHandler(HttpStatusCode.INTERNAL_SERVER_ERROR, next).handle
      );

    return res.sendStatus(200);
  };
}
