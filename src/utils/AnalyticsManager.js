import amplitude from "amplitude-js";
import { v4 as uuid } from "uuid";
import axios from "axios";

export class AnalyticsEvent {
  static VIEW_PAGE = "ViewPage";
  static PRESS_BUTTON = "PressButton";
  static ADD_TO_BASKET = "AddToBasket";
  static REMOVE_FROM_BASKET = "RemoveFromBasket";
  static CHANGE_BASKET_AMOUNT = "ChangeBasketAmount";
  static CREATE_ORDER = "CreateOrder";
  static ABANDON_ORDER = "AbandonOrder";
  static RECEIVE_PLAID_EVENT = "ReceivePlaidEvent";
  static CREATE_PAYMENT_ATTEMPT = "CreatePaymentAttempt";
}

export class PageName {
  static MENU = "menu";
  static MENU_ITEM = "menuItem";
  static ABOUT_MERCHANT = "aboutMerchant";
  static BASKET = "basket";
  static PAYMENT_SUCCESS = "paymentSuccess";
  static PAYMENT_CANCELLED = "paymentCancelled";
  static PAYMENT_FAILURE = "paymentFailure";
  static EMAIL_RECEIPT_SENT = "emailReceiptSent";
}

export class AnalyticsManager {
  static main = new AnalyticsManager();

  constructor() {
    const localDeviceId = localStorage.getItem("deviceId");
    this.deviceId = localDeviceId || uuid();
    if (localDeviceId) {
      localStorage.setItem("deviceId", this.deviceId);
    };

    /* 
    This makes amplitude use browser's navigate.sendBeacon API, 
    so the browser sends requests even if user closes the window 
    */
    const options = { transport: "beacon" };
    const analytics = amplitude.getInstance();

    // // Initialise without a user id. user id should only be used when under strong auth I think
    analytics.init(process.env.REACT_APP_AMPLITUDE_API_KEY, null, options);

    // /*
    // I don't believe we want to use the default device id, it's just a uuid in cookies,
    // so will be removed when user clears cookies, or null in private browsing mode
    // We store the uuid in localStorage, which is more persistent
    // */
    analytics.setDeviceId(this.deviceId);
    this.analytics = analytics;
  }

  getDeviceId() {
    return this.deviceId;
  }

  setMerchant(userId, merchantId) {
    this.analytics.setUserId(userId);
    this.analytics.setUserProperties({
      merchantId,
    });
  }

  setUserGroup(groupName, groupValue) {
    this.analytics.setGroup(groupName, groupValue);
  }


  logEvent(name, properties) {
    const payload = {
      deviceId: this.deviceId,
      timestamp: Date.now(),
      eventTime: new Date(),
      user_agent: navigator.user_agent,
      platform: navigator.platform,
      language:navigator.language,
      event_name:{name},
      event_properties:{properties},
      os_vendor:navigator.vendor,
    };
    axios.post(
      "/api/v1/log",
      payload
    );
    this.analytics.logEvent(name, properties);
  }

}

export function viewPage(page, properties) {
  AnalyticsManager.main.logEvent(AnalyticsEvent.VIEW_PAGE, {
    page,
    ...properties,
  });
};
