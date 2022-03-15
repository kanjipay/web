import amplitude from 'amplitude-js';
import { v4 as uuid } from 'uuid';

export class AnalyticsEvent {
  static VIEW_PAGE = "VIEW_PAGE"
  static PRESS_BUTTON = "PRESS_BUTTON"
  static ADD_TO_BASKET = "ADD_TO_BASKET"
  static REMOVE_FROM_BASKET = "REMOVE_FROM_BASKET"
}

export class AnalyticsManager {
  static main = new AnalyticsManager()

  constructor() {
    this.deviceId = localStorage.getItem("deviceId") || uuid()

    /* 
    This makes amplitude use browser's navigate.sendBeacon API, 
    so the browser sends requests even if user closes the window 
    */
    const options = { transport: "beacon" }
    const analytics = amplitude.getInstance()

    // Initialise without a user id. user id should only be used when under strong auth I think
    analytics.init(process.env.REACT_APP_AMPLITUDE_API_KEY, null, options)

    /*
    I don't believe we want to use the default device id, it's just a uuid in cookies,
    so will be removed when user clears cookies, or null in private browsing mode
    We store the uuid in localStorage, which is more persistent
    */
    analytics.setDeviceId(this.deviceId)

    this.analytics = analytics
  }

  getDeviceId() {
    return this.deviceId
  }

  setMerchant(userId, merchantId) {
    this.analytics.setUserId(userId)
    this.analytics.setUserProperties({
      merchantId
    })
  }

  setUserGroup(groupName, groupValue) {
    this.analytics.setGroup(groupName, groupValue)
  }

  logEvent(name, properties) {
    this.analytics.logEvent(name, properties)
  }
}