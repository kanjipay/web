import { firestore } from "firebase-admin"
import { processSuccessfulTicketsOrder } from "../../../shared/utils/processSuccessfulTicketsOrder"
import BaseController from "../../../shared/BaseController"
import Collection from "../../../shared/enums/Collection"
import OrderStatus from "../../../shared/enums/OrderStatus"
import { OrderType } from "../../../shared/enums/OrderType"
import { db } from "../../../shared/utils/admin"
import { HttpError, HttpStatusCode } from "../../../shared/utils/errors"
import { fetchDocument } from "../../../shared/utils/fetchDocument"
import LoggingController from "../../../shared/utils/loggingClient"
import { sendMenuReceiptEmail } from "../../../shared/utils/sendEmail"
import MerchantStatus from "../../../shared/enums/MerchantStatus"
import { fetchDocumentsInArray } from "../../../shared/utils/fetchDocumentsInArray"
import axios from "axios"
import { logger } from "firebase-functions/v1"
import { generateTicketPass } from "../../../shared/utils/applePass/generateTicketPass"
import * as JSZip from "jszip"

enum OpenBankingSettings {
  ON = "ON",
  DEEMPHASISED = "DEEMPHASISED",
  OFF = "OFF"
}

enum DeviceType {
  MOBILE = "Mobile",
  TABLET = "Tablet",
  DESKTOP = "Desktop",
  OTHER = "Other",
}

enum Gender {
  MALE = "Male",
  FEMALE = "Female",
  NOT_DETERMINED = "Not determined",
}

enum PaymentType {
  STRIPE = "STRIPE",
  OPEN_BANKING = "OPEN_BANKING",
}

function getPaymentTypes(merchant: any) {
  const { currency, crezco, openBankingSettings } = merchant

  let paymentTypes = [PaymentType.STRIPE]

  if (
    !!crezco?.userId && 
    currency === "GBP" && 
    [OpenBankingSettings.ON, OpenBankingSettings.DEEMPHASISED].includes(openBankingSettings ?? OpenBankingSettings.ON)
  ) {
    paymentTypes.push(PaymentType.OPEN_BANKING)
  }

  return paymentTypes
}

async function getGender(userId: string) {
  logger.log("Retrieving gender of user", { userId })
  const { user, userError } = await fetchDocument(Collection.USER, userId)

  if (userError) {
    return [null, userError]
  }

  logger.log("Retrieved user", { user })

  const { firstName, gender: existingUserGender } = user

  let gender: Gender

  if (existingUserGender) {
    logger.log("Gender exists on user", { existingUserGender })
    gender = existingUserGender
  } else if (firstName) {
    try {
      const url = "https://api.genderize.io"
      logger.log("No gender on user, retrieving from endpoint", { url })
      const { data: genderResData } = await axios.get(url, {
        params: {
          name: firstName,
        },
      })

      const { gender: genderFromApi, probability } = genderResData

      logger.log("Got response from gender api", { ...genderResData })

      if (probability > 0.95) {
        gender = genderFromApi === "male" ? Gender.MALE : Gender.FEMALE
      } else {
        gender = Gender.NOT_DETERMINED
      }

      logger.log("Updating user with gender", { gender, userId })

      await db().collection(Collection.USER).doc(userId).update({ gender })
    } catch (err) {
      logger.log("error retrieving from genderize", err)
    }
  } else {
    gender = Gender.NOT_DETERMINED
  }

  return [gender, null]
}

function getUserAgentData(userAgent: any) {
  let deviceType: DeviceType

  const { browser, platform, os, isMobile, isDesktop, isTablet } = userAgent

  if (isMobile) {
    deviceType = DeviceType.MOBILE
  } else if (isTablet) {
    deviceType = DeviceType.TABLET
  } else if (isDesktop) {
    deviceType = DeviceType.DESKTOP
  } else {
    deviceType = DeviceType.OTHER
  }

  return {
    deviceType,
    browser,
    platform,
    os,
  }
}

async function getLocationData(ip: string) {
  logger.log("Getting location from ip", { ip })

  const { ipGeolocation: existingIpGeolocation } = await fetchDocument(
    Collection.IP_GEOLOCATION,
    ip
  )

  let ipGeolocation: any

  if (existingIpGeolocation) {
    logger.log("Found existing geolocation data for ip")
    ipGeolocation = existingIpGeolocation
  } else {
    logger.log("No existing data for ip, calling geolocation from ip endpoint")
    const { data: geolocationResData } = await axios.get(
      "https://api.ipgeolocation.io/ipgeo",
      {
        params: {
          apiKey: process.env.IP_GEOLOCATION_API_KEY,
          ip,
        },
      }
    )

    const { latitude: latitudeString, longitude: longitudeString } =
      geolocationResData

    logger.log("Got location from ip", { latitudeString, longitudeString })

    const latitude = parseFloat(latitudeString)
    const longitude = parseFloat(longitudeString)
    const coordinates = new firestore.GeoPoint(latitude, longitude)

    logger.log("Calling reverse geocoding endpoint")

    const { data: geocodingResData } = await axios.get(
      "https://maps.googleapis.com/maps/api/geocode/json",
      {
        params: {
          key: process.env.GOOGLE_MAPS_API_KEY,
          latlng: `${latitude},${longitude}`,
        },
      }
    )

    logger.log("Got geocoding data", { ...geocodingResData })

    const relevantLocationTypes = [
      "neighborhood",
      "sublocality",
      "administrative_area_level_3",
    ]

    const locationName = geocodingResData.results
      .map((result) => {
        return result.address_components.filter((comp) => {
          return comp.types.some((type) => relevantLocationTypes.includes(type))
        })
      })
      .filter((addressComponents) => addressComponents.length > 0)
      .reduce((selectedAddressComponents, addressComponents) => {
        if (addressComponents.length > selectedAddressComponents.length) {
          return addressComponents
        } else {
          return selectedAddressComponents
        }
      }, [])
      .map((addressComponent) => addressComponent.long_name)
      .slice(0, 2)
      .join(", ")

    logger.log("Imputed location name", { locationName })

    const geolocationData = {
      locationName,
      coordinates,
    }

    logger.log("Saving data to IP geolocation object", { geolocationData })

    await db()
      .collection(Collection.IP_GEOLOCATION)
      .doc(ip)
      .set(geolocationData)

    ipGeolocation = geolocationData
  }

  const { coordinates, locationName } = ipGeolocation

  return { coordinates, locationName }
}

async function isExistingUser(userId: string, merchantId: string) {
  const paidOrderSnapshot = await db()
    .collection(Collection.ORDER)
    .where("userId", "==", userId)
    .where("merchantId", "==", merchantId)
    .where("status", "in", [OrderStatus.PAID, OrderStatus.FULFILLED])
    .get()

  return paidOrderSnapshot.docs.length > 0
}

export class OrdersController extends BaseController {
  abandon = async (req, res, next) => {
    try {
      const { orderId } = req.params
      const userId: string = req.user.id

      const { order, orderError } = await fetchDocument(
        Collection.ORDER,
        orderId,
        { userId }
      )

      if (orderError) {
        next(orderError)
        return
      }

      const { orderItems, type, status, merchantId } = order

      if (status === OrderStatus.PENDING) {
        const updateOrderStatus = db()
          .collection(Collection.ORDER)
          .doc(orderId)
          .update({ status: OrderStatus.ABANDONED })

        const promises = [updateOrderStatus]

        if (type === OrderType.TICKETS) {
          const { productId, quantity } = orderItems[0]

          const updateProduct = db()
            .collection(Collection.PRODUCT)
            .doc(productId)
            .update({
              reservedCount: firestore.FieldValue.increment(-quantity),
            })

          promises.push(updateProduct)
        }

        await Promise.all(promises)
      }

      let redirectPath

      switch (type) {
        case OrderType.TICKETS:
          redirectPath = `/events/${merchantId}/${order.eventId}/${orderItems[0].productId}`
          break
        case OrderType.MENU:
          redirectPath = `/menu/${merchantId}`
          break
        default:
          redirectPath = "/"
      }

      return res.status(200).json({ redirectPath })
    } catch (err) {
      next(err)
    }
  }

  enrich = async (req, res, next) => {
    try {
      const { orderId } = req.params
      const locale = req.body?.locale
      const userId: string = req.user.id

      logger.log("Enriching order data", { orderId, userId })

      const { order, orderError } = await fetchDocument(
        Collection.ORDER,
        orderId,
        { userId }
      )

      if (orderError) {
        next(orderError)
        return
      }

      const { merchantId } = order

      const [isExisting, [gender, genderError]] = await Promise.all([
        isExistingUser(userId, merchantId),
        getGender(userId),
      ])

      if (genderError) {
        next(genderError)
        return
      }

      logger.log("Imputed gender from user's name", { gender })

      const userAgentData = getUserAgentData(req.useragent)

      logger.log("Got data from user agent", { ...userAgentData })

      const orderUpdate = {
        gender,
        locale,
        isExistingUser: isExisting,
        ...userAgentData,
      }

      const ip =
        req.headers["x-appengine-user-ip"] ?? req.headers["x-forwarded-for"]

      if (ip) {
        const { coordinates, locationName } = await getLocationData(ip)
        orderUpdate["coordinates"] = coordinates
        orderUpdate["locationName"] = locationName
      }

      logger.log("Updating order with data", { sessionData: orderUpdate })

      await db().collection(Collection.ORDER).doc(orderId).update({
        sessionData: orderUpdate,
      })

      logger.log("Order updated")

      return res.sendStatus(200)
    } catch (err) {
      next(err)
    }
  }

  createWithTickets = async (req, res, next) => {
    try {
      const logger = new LoggingController("Create ticket order")

      const userId = req.user.id
      const { productId, quantity, deviceId, attributionData, orderId } = req.body
      logger.log("Read initial variables", {
        userId,
        productId,
        quantity,
        deviceId,
        orderId
      })

      const { product, productError } = await fetchDocument(
        Collection.PRODUCT,
        productId
      )

      if (productError) {
        next(productError)
        return
      }

      const {
        soldCount,
        reservedCount,
        capacity,
        eventId,
        merchantId,
        price,
        title,
      } = product

      logger.log("Got product", { product })

      if (soldCount + reservedCount + quantity > capacity) {
        const errorMessage = "This ticket is sold out."
        logger.log("Ticket is sold out", {
          soldCount,
          reservedCount,
          quantity,
          capacity,
        })
        next(
          new HttpError(HttpStatusCode.BAD_REQUEST, errorMessage, errorMessage)
        )
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
        existingTicketDocs,
      ] = await Promise.all([
        fetchDocument(Collection.EVENT, eventId),
        fetchDocument(Collection.MERCHANT, merchantId),
        fetchExistingTickets,
      ])

      for (const error of [eventError, merchantError]) {
        if (error) {
          next(eventError)
          return
        }
      }

      const openBankingSettings = merchant.openBankingSettings ?? OpenBankingSettings.ON

      const paymentTypes = getPaymentTypes(merchant)

      const currentTicketCount = existingTicketDocs.docs.length

      logger.log("Got event, merchant and existing tickets", {
        event,
        merchant,
        currentTicketCount,
      })

      const { maxTicketsPerPerson, endsAt, eventRecurrenceId } = event

      if (!event.isPublished) {
        const errorMessage = "This event hasn't been published yet"
        next(
          new HttpError(HttpStatusCode.BAD_REQUEST, errorMessage, errorMessage)
        )
        return
      }

      if (currentTicketCount + quantity > maxTicketsPerPerson) {
        let errorMessage: string

        if (currentTicketCount > 0) {
          errorMessage = `You can only order ${maxTicketsPerPerson} tickets per person. You currently have ${currentTicketCount} and tried to order ${quantity}.`
        } else {
          errorMessage = `You can only order ${maxTicketsPerPerson} tickets per person.`
        }

        logger.log("Order violates max tickets per person policy", {
          currentTicketCount,
          quantity,
          maxTicketsPerPerson,
        })

        next(
          new HttpError(HttpStatusCode.BAD_REQUEST, errorMessage, errorMessage)
        )
        return
      }

      const emailDomain =
        merchant.emailDomain ?? event.emailDomain ?? product.emailDomain

      if (emailDomain) {
        logger.log("Got required email domain for ticket: ", emailDomain)

        const { email } = req.user

        logger.log("Checking email domain", {
          emailDomain,
          email,
        })

        if (email.slice(email.length - emailDomain.length) !== emailDomain) {
          const errorMessage = `Your email must end in ${emailDomain}.`
          next(
            new HttpError(
              HttpStatusCode.BAD_REQUEST,
              errorMessage,
              errorMessage
            )
          )
          return
        }
      } else {
        logger.log("No required email domain found for ticket")
      }

      const { currency, customerFee } = merchant
      const mercadoFee = merchant.mercadoFee ?? 0

      const total = Math.round(price * quantity * (1 + customerFee))

      logger.log("Calculated total for order", {
        total,
        quantity,
        price,
        customerFee,
      })

      const isFree = total === 0

      const orderData = {
        createdAt: firestore.FieldValue.serverTimestamp(),
        status: isFree ? OrderStatus.PAID : OrderStatus.PENDING,
        type: OrderType.TICKETS,
        total,
        currency,
        deviceId,
        userId,
        eventId,
        merchantId,
        customerFee,
        mercadoFee,
        paymentTypes,
        openBankingPaymentAttempts: 0,
        openBankingSettings,
        orderItems: [
          {
            productId,
            eventId,
            eventTitle: event.title,
            title,
            price,
            eventEndsAt: endsAt,
            quantity,
          },
        ],
        wereTicketsCreated: isFree,
      }

      if (eventRecurrenceId) {
        orderData["eventRecurrenceId"] = eventRecurrenceId
      }

      if (attributionData) {
        orderData["attributionData"] = attributionData
      }

      logger.log("Formulated order data", { orderData })

      const promises: Promise<any>[] = []

      if (isFree) {
        logger.log("Event is free, processing successful order")

        promises.push(
          processSuccessfulTicketsOrder(
            merchant,
            event,
            product,
            orderId,
            userId,
            quantity
          )
        )
      }

      const createOrder = db()
        .collection(Collection.ORDER)
        .doc(orderId)
        .set(orderData)

      if (!isFree) {
        const updateProduct = db()
        .collection(Collection.PRODUCT)
        .doc(productId)
        .update({
          reservedCount: firestore.FieldValue.increment(quantity),
        })
        promises.push(updateProduct)
      }

      promises.push(createOrder)

      logger.log("Formulated order data to save", { orderData })

      await Promise.all(promises)

      return res.sendStatus(200)
    } catch (err) {
      next(err)
    }
  }

  fetchApplePasses = async (req, res, next) => {
    try {
      const userId = req.user.id
      const { orderId } = req.params

      const ticketSnapshot = await db()
        .collection(Collection.TICKET)
        .where("userId", "==", userId)
        .where("orderId", "==", orderId)
        .get()

      const ticketIds = ticketSnapshot.docs.map(doc => doc.id)

      if (ticketIds.length === 0) {
        next(new HttpError(HttpStatusCode.BAD_REQUEST, "Tickets not found"))
        return
      }

      const eventId = ticketSnapshot.docs[0].data().eventId

      const { event, eventError } = await fetchDocument(Collection.EVENT, eventId)

      if (eventError) {
        next(eventError)
        return
      }

      const passBuffers = await Promise.all(ticketIds.map(ticketId => generateTicketPass(event, ticketId)))
      const passStrings = passBuffers.map(buffer => buffer.toString("base64"))

      const zip = new JSZip()

      passStrings.forEach((passString, index) => {
        zip.file(`${index}.pkpass`, passString, { base64: true })
      })

      const passesBuffer = await zip.generateAsync({ type: "nodebuffer" })
      const passesString = passesBuffer.toString("base64")

      return res.status(200).json({ passStrings, passesString })
    } catch (err) {
      next(err)
    }
  }

  private async fetchMenuItems(
    requestedItems: { id: string; quantity: number; title: string }[],
    merchantId: string
  ) {
    const requestedMenuItemIds = requestedItems.map((item) => item.id)

    const query = db()
      .collection(Collection.MENU_ITEM)
      .where("merchantId", "==", merchantId)

    const menuItems = await fetchDocumentsInArray(
      query,
      firestore.FieldPath.documentId(),
      requestedMenuItemIds
    )

    return menuItems
  }

  private checkMenuItemsForErrors(
    requestedItems: { id: string; quantity: number; title: string }[],
    menuItems
  ): HttpError | null {
    const menuItemIds = menuItems.map((item) => item.id)
    const unavailableItemIds = menuItems
      .filter((item) => !item.isAvailable)
      .map((item) => item.id)

    const nonexistantMenuItemTitles = requestedItems
      .filter((item) => !menuItemIds.includes(item.id))
      .map((item) => item.title)

    const unavailableMenuItemTitles = requestedItems
      .filter((item) => unavailableItemIds.includes(item.id))
      .map((item) => item.title)

    if (nonexistantMenuItemTitles.length > 0) {
      const isPlural = nonexistantMenuItemTitles.length > 1
      const errorMessage = `We couldn't find the following item${
        isPlural ? "s" : ""
      } on the menu: ${nonexistantMenuItemTitles.join(
        ", "
      )}. Please remove from your basket to continue.`
      return new HttpError(
        HttpStatusCode.BAD_REQUEST,
        errorMessage,
        errorMessage
      )
    }

    if (unavailableMenuItemTitles.length > 0) {
      const isPlural = unavailableMenuItemTitles.length > 1
      const errorMessage = `The following item${
        isPlural ? "s are" : " is"
      } currently unavailable: ${unavailableMenuItemTitles.join(
        ", "
      )}. Please remove from your basket to continue.`
      return new HttpError(
        HttpStatusCode.BAD_REQUEST,
        errorMessage,
        errorMessage
      )
    }

    return null
  }

  private calculateOrderTotal(
    requestedItems: { id: string; quantity: number; title: string }[],
    menuItems
  ): number {
    const prices = menuItems.reduce((obj, item) => {
      obj[item.id] = item.price
      return obj
    }, {})

    const total = requestedItems.reduce((currTotal, item) => {
      const price = prices[item.id] || 0
      return currTotal + item.quantity * price
    }, 0)

    return total
  }

  private async generateOrderNumber(
    merchantId: string,
    loggingClient: LoggingController
  ): Promise<number> {
    const startOfToday = new Date()
    startOfToday.setUTCHours(0, 0, 0, 0)

    const latestOrdersSnap = await db()
      .collection(Collection.ORDER)
      .where("merchantId", "==", merchantId)
      .where("createdAt", ">=", startOfToday)
      .orderBy("createdAt", "desc")
      .limit(1)
      .get()
    // .catch(new ErrorHandler(HttpStatusCode.INTERNAL_SERVER_ERROR, next).handle)

    let orderNumber

    const latestOrders = latestOrdersSnap.docs.map((doc) => ({
      id: doc.id,
      orderNumber: doc.data().orderNumber,
    }))

    if (latestOrders.length > 0) {
      const latestOrderNumber = latestOrders[0].orderNumber || 1
      orderNumber = latestOrderNumber + 1
    } else {
      orderNumber = 1
    }

    loggingClient.log("Order number set", {}, { orderNumber })

    return orderNumber
  }

  private generateOrderItems(
    requestedItems: { id: string; quantity: number; title: string }[],
    menuItems
  ): {
    menuItemId: string
    quantity: number
    title: string
    photo: string
    price: number
  }[] {
    return requestedItems.map((item) => {
      const menuItem = menuItems.find((menuItem) => menuItem.id === item.id)

      const { title, photo, price } = menuItem

      return {
        menuItemId: item.id,
        quantity: item.quantity,
        title,
        photo,
        price,
      }
    })
  }

  private async createOrderItems(orderId: string, orderItems) {
    const batch = db().batch()

    for (const item of orderItems) {
      const orderItemRef = db().collection("OrderItem").doc()

      batch.set(orderItemRef, {
        orderId,
        ...item,
      })
    }

    await batch.commit()
  }

  createWithMenu = async (req, res, next) => {
    try {
      const { requestedItems, merchantId, deviceId, userId } = req.body

      const loggingClient = new LoggingController("Order Controller")
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
      )

      const { merchant, merchantError } = await fetchDocument(
        Collection.MERCHANT,
        merchantId,
        { status: MerchantStatus.OPEN }
      )
      const { currency } = merchant

      if (merchantError) {
        next(merchantError)
        return
      }

      const menuItems = await this.fetchMenuItems(requestedItems, merchantId)
      const menuItemError = this.checkMenuItemsForErrors(
        requestedItems,
        menuItems
      )

      if (menuItemError) {
        next(menuItemError)
        return
      }

      const total = this.calculateOrderTotal(requestedItems, menuItems)
      const orderItems = this.generateOrderItems(requestedItems, menuItems)
      const orderNumber = await this.generateOrderNumber(
        merchantId,
        loggingClient
      )

      const orderRef = await db().collection(Collection.ORDER).add({
        createdAt: firestore.FieldValue.serverTimestamp(),
        status: OrderStatus.PENDING,
        type: OrderType.MENU,
        total,
        currency,
        deviceId,
        userId,
        merchantId,
        receiptSent: false,
        orderNumber,
        orderItems,
      })

      const orderId = orderRef.id

      loggingClient.log("Order document creation complete", {}, { orderId })

      await this.createOrderItems(orderId, orderItems)

      loggingClient.log("Order subcollection creation complete")

      return res.status(200).json({ orderId })
    } catch (err) {
      next(err)
    }
  }

  sendMenuReceipt = async (req, res, next) => {
    try {
      const { email, orderId } = req.body

      const { order, orderError } = await fetchDocument(
        Collection.ORDER,
        orderId,
        { receiptSent: false }
      )

      if (orderError) {
        next(orderError)
        return
      }

      const { merchantId, orderNumber, orderItems, total } = order

      const { merchant, merchantError } = await fetchDocument(
        Collection.MERCHANT,
        merchantId
      )

      if (merchantError) {
        next(merchantError)
        return
      }

      const { displayName, currency } = merchant

      const sendEmail = sendMenuReceiptEmail(
        email,
        displayName,
        orderNumber,
        orderItems,
        total,
        currency
      )

      const updateOrder = db()
        .collection(Collection.ORDER)
        .doc(orderId)
        .update({ receiptSent: true })

      await Promise.all([sendEmail, updateOrder])

      return res.sendStatus(200)
    } catch (err) {
      next(err)
    }
  }
}
