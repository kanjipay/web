import { v4 as uuid } from "uuid";

export class LocalStorageKeys {
  static DEVICE_ID = "deviceId"
  static PSEUDO_USER_ID = "pseudoUserId"
  static MONEYHUB_BANK_ID = "moneyhubBankId"
  static BASKET = "basket"
  static BASKET_MERCHANT = "basketMerchant"
}

export class IdentityManager {
  static main = new IdentityManager()

  constructor() {
    const deviceId = localStorage.getItem(LocalStorageKeys.DEVICE_ID) ?? uuid()
    this.setDeviceId(deviceId)

    const pseudoUserId = localStorage.getItem(LocalStorageKeys.PSEUDO_USER_ID) ?? uuid()
    this.setPseudoUserId(pseudoUserId)
  }

  setDeviceId(deviceId) {
    this.deviceId = deviceId
    localStorage.setItem(LocalStorageKeys.DEVICE_ID, deviceId)
  }

  getDeviceId() {
    return this.deviceId
  }

  setPseudoUserId(pseudoUserId) {
    this.pseudoUserId = pseudoUserId
    localStorage.setItem(LocalStorageKeys.PSEUDO_USER_ID, pseudoUserId)
  }

  getPseudoUserId() {
    return this.pseudoUserId
  }
}