import BaseController from "../../../shared/BaseController";
import { HttpError, HttpStatusCode } from "../../../shared/utils/errors";
import { db } from "../../../shared/utils/admin";
import Collection from "../../../shared/enums/Collection";
import OrderStatus from "../../../shared/enums/OrderStatus";
import MerchantStatus from "../../../shared/enums/MerchantStatus";
import LoggingController from "../../../shared/utils/loggingClient";
import { fetchDocument } from "../../../shared/utils/fetchDocument";
import { createMercadoPaymentIntent } from "../../utils/mercadoClient";
import { firestore } from "firebase-admin";
import { OrderType } from "../../../shared/enums/OrderType";
import { processSuccessfulTicketsOrder } from "../../utils/processSuccessfulTicketsOrder";
import { v4 as uuid } from "uuid"
import { sendMenuReceiptEmail } from "../../../shared/utils/sendEmail";

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

  createWithMenuItems = async (req, res, next) => {
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
    const { payeeId, currency } = merchant

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
    const { paymentIntentId, checkoutUrl } = await createMercadoPaymentIntent(total, payeeId, currency, OrderType.MENU)

    const orderRef = await db()
      .collection(Collection.ORDER)
      .add({
        createdAt: firestore.FieldValue.serverTimestamp(),
        status: OrderStatus.PENDING,
        type: OrderType.MENU,
        mercado: {
          paymentIntentId
        },
        total,
        currency,
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

  createWithTickets = async (req, res, next) => {
    try {
      const logger = new LoggingController("Create ticket order")

      const userId = req.user.id
      const { productId, quantity, deviceId } = req.body

      logger.log("Read initial variables", {}, {
        userId,
        productId,
        quantity,
        deviceId
      })

      const { product, productError } = await fetchDocument(Collection.PRODUCT, productId)

      if (productError) {
        next(productError)
        return
      }

      const { soldCount, reservedCount, capacity, eventId, merchantId, price, title } = product

      logger.log("Got product", {
        product
      }, {
        eventId,
        merchantId,
        price
      })

      if (soldCount + reservedCount + quantity >= capacity) {
        const errorMessage = "This ticket is sold out."
        next(new HttpError(HttpStatusCode.BAD_REQUEST, errorMessage, errorMessage))
        return
      }

      if (!product.isPublished) {
        const errorMessage = "This ticket hasn't been published yet"
        next(new HttpError(HttpStatusCode.BAD_REQUEST, errorMessage, errorMessage))
        return
      }

      const fetchExistingTickets = db()
        .collection(Collection.TICKET)
        .where("userId", "==", userId)
        .where("eventId", "==", eventId)
        .get()

      const [
        { event, eventError },
        { merchant, merchantError },
        existingTicketDocs
      ] = await Promise.all([
        fetchDocument(Collection.EVENT, eventId),
        fetchDocument(Collection.MERCHANT, merchantId),
        fetchExistingTickets
      ])

      for (const error of [eventError, merchantError]) {
        if (error) {
          next(eventError)
          return
        }
      }

      const { maxTicketsPerPerson, endsAt } = event

      const currentTicketCount = existingTicketDocs.docs.length

      logger.log("Got event, merchant and existing tickets", {
        event,
        merchant,
        currentTicketCount,
        maxTicketsPerPerson
      })

      if (!event.isPublished) {
        const errorMessage = "This event hasn't been published yet"
        next(new HttpError(HttpStatusCode.BAD_REQUEST, errorMessage, errorMessage))
        return
      }

      if (currentTicketCount + quantity > maxTicketsPerPerson) {
        let errorMessage: string

        if (currentTicketCount > 0) {
          errorMessage = `You can only order ${maxTicketsPerPerson} tickets per person. You currently have ${currentTicketCount} and tried to order ${quantity}.`
        } else {
          errorMessage = `You can only order ${maxTicketsPerPerson} tickets per person.`
        }

        next(new HttpError(HttpStatusCode.BAD_REQUEST, errorMessage, errorMessage))
        return
      }

      const emailDomain = merchant.emailDomain ?? event.emailDomain ?? product.emailDomain
      
      if (emailDomain) {
        const { email } = req.user

        logger.log("Checking email domain", {
          emailDomain,
          email
        })

        if (email.slice(email.length - emailDomain.length) !== emailDomain) {
          const errorMessage = `Your email must end in ${emailDomain}.`
          next(new HttpError(HttpStatusCode.BAD_REQUEST, errorMessage, errorMessage))
          return
        }
      }

      const { payeeId, currency } = merchant

      const total = price * quantity

      let redirectUrl: string

      const orderId = uuid()

      const orderData = {
        createdAt: firestore.FieldValue.serverTimestamp(),
        status: OrderStatus.PENDING,
        type: OrderType.TICKETS,
        total,
        currency,
        deviceId,
        userId,
        eventId,
        merchantId,
        orderItems:  [{
          productId,
          eventId,
          eventTitle: event.title,
          title,
          price,
          eventEndsAt: endsAt,
          quantity
        }],
        wereTicketsCreated: false
      }

      const promises: Promise<any>[] = []

      if (total > 0) {
        logger.log("Event is paid, creating payment intent")
        const { paymentIntentId, checkoutUrl } = await createMercadoPaymentIntent(total, payeeId, currency, OrderType.TICKETS)

        logger.log("Created payment intent", {
          paymentIntentId,
          checkoutUrl
        })

        orderData["mercado"] = {
          paymentIntentId
        }

        redirectUrl = checkoutUrl
      } else {
        logger.log("Event is free, processing successful order")

        promises.push(
          processSuccessfulTicketsOrder(
            merchantId, 
            eventId, 
            event.title,
            productId,
            product.title,
            product.price, 
            orderId,
            userId,
            endsAt,
            merchant.currency,
            quantity
          )
        )

        redirectUrl = `${process.env.CLIENT_URL}/events/s/orders/${orderId}/confirmation`
      }

      const createOrder = db()
        .collection(Collection.ORDER)
        .doc(orderId)
        .set(orderData);

      const updateProduct = db()
        .collection(Collection.PRODUCT)
        .doc(productId)
        .update({
          reservedCount: firestore.FieldValue.increment(quantity)
        })

      promises.push(createOrder)
      promises.push(updateProduct)

      logger.log("Formulated order data to save", { orderData })

      await Promise.all(promises)

      logger.log("Function successful", {
        redirectUrl,
        orderId
      })

      res.status(200).json({ redirectUrl, orderId })
    } catch (err) {
      next(err)
    }
  }

  sendEmailReceipt = async (req, res, next) => {
    const { email, orderId } = req.body;

    const { order, orderError } = await fetchDocument(Collection.ORDER, orderId, { receiptSent: false })

    if (orderError) {
      next(orderError)
      return
    }

    const { merchantId, orderNumber, orderItems, total } = order

    const { merchant, merchantError } = await fetchDocument(Collection.MERCHANT, merchantId)

    if (merchantError) {
      next(merchantError)
      return
    }

    const { displayName, currency } = merchant

    const sendEmail = sendMenuReceiptEmail(email, displayName, orderNumber, orderItems, total, currency)

    const updateOrder = db()
      .collection(Collection.ORDER)
      .doc(orderId)
      .update({ receiptSent: true })

    await Promise.all([
      sendEmail,
      updateOrder
    ])

    return res.sendStatus(200);
  };
}
