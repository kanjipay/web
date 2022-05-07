import axios from "axios"
import { getAuth } from "firebase/auth"
import { auth } from "./FirebaseUtils"

export class ApiName {
  static INTERNAL = "internal"
  static ONLINE_MENU = "onlineMenu"
  static CLIENT_API = "clientApi"
}

export class NetworkManager {
  static apiUrl(apiName) {
    return `${process.env.REACT_APP_BASE_SERVER_URL}/${apiName}`
  }

  static async call(
    apiName,
    method,
    path,
    data = {},
    headers = {}
  ) {
    const requestConfig = {
      url: `${process.env.REACT_APP_BASE_SERVER_URL}/${apiName}/api/v1${path}`,
      method,
      headers,
      data
    }

    const currUser = auth.currentUser

    if (currUser) {
      const idToken = await currUser.getIdToken()
      requestConfig.headers["Authorization"] = `Bearer ${idToken}`
    }

    return axios.request(requestConfig)
  }

  static async get(apiName, path, data, headers = {}) {
    return this.call(apiName, "get", path, data, headers)
  }

  static async post(apiName, path, data, headers = {}) {
    return this.call(apiName, "post", path, data, headers)
  }

  static async put(apiName, path, data, headers = {}) {
    return this.call(apiName, "put", path, data, headers)
  }

  static async delete(apiName, path, data, headers = {}) {
    return this.call(apiName, "delete", path, data, headers)
  }
}