import amplitude from "amplitude-js"
import { IdentityManager } from "./IdentityManager"
import { hotjar } from "react-hotjar"
import Environment from "../enums/Environment"

export class AnalyticsEvent {
  static VIEW_PAGE = "ViewPage"
  static PRESS_BUTTON = "PressButton"
  static ADD_TO_BASKET = "AddToBasket"
  static REMOVE_FROM_BASKET = "RemoveFromBasket"
  static CHANGE_BASKET_AMOUNT = "ChangeBasketAmount"
  static CREATE_ORDER = "CreateOrder"
  static ABANDON_PAYMENT_INTENT = "AbandonPaymentIntent"
  static RECEIVE_PLAID_EVENT = "ReceivePlaidEvent"
  static CREATE_PAYMENT_ATTEMPT = "CreatePaymentAttempt"
}

export class PageName {
  static MENU = "menu"
  static MENU_ITEM = "menuItem"
  static ABOUT_MERCHANT = "aboutMerchant"
  static BASKET = "basket"
  static PAYMENT_SUCCESS = "paymentSuccess"
  static PAYMENT_CANCELLED = "paymentCancelled"
  static PAYMENT_FAILURE = "paymentFailure"
  static EMAIL_RECEIPT_SENT = "emailReceiptSent"
}

export class AnalyticsManager {
  static main = new AnalyticsManager()

  constructor() {
    /* 
    This makes amplitude use browser's navigate.sendBeacon API, 
    so the browser sends requests even if user closes the window 
    */
    const options = { transport: "beacon" }
    const analytics = amplitude.getInstance()

    const pseudoUserId = IdentityManager.main.getPseudoUserId()

    analytics.init(
      process.env.REACT_APP_AMPLITUDE_API_KEY,
      pseudoUserId,
      options
    )

    if (
      [Environment.PROD, Environment.STAGING].includes(
        process.env.REACT_APP_ENV_NAME
      )
    ) {
      hotjar.initialize(process.env.REACT_APP_HOTJAR_ID, 6)
      hotjar.identify(pseudoUserId)
    }

    // /*
    // I don't believe we want to use the default device id, it's just a uuid in cookies,
    // so will be removed when user clears cookies, or null in private browsing mode
    // We store the uuid in localStorage, which is more persistent
    // */
    analytics.setDeviceId(IdentityManager.main.getDeviceId())

    this.analytics = analytics
  }

  setUserGroup(groupName, groupValue) {
    this.analytics.setGroup(groupName, groupValue)
  }

  logEvent(name, properties = {}) {
    this.analytics.logEvent(name, properties)
  }

  viewPage(page, properties = {}) {
    this.analytics.logEvent(AnalyticsEvent.VIEW_PAGE, {
      page,
      ...properties,
    })
  }

  pressButton(button, properties = {}) {
    this.analytics.logEvent(AnalyticsEvent.PRESS_BUTTON, {
      button,
      ...properties,
    })
  }
}
