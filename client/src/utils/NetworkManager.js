import axios from "axios"
import { auth } from "./FirebaseUtils"
import { isExpired } from "./helpers/decodeJwt"

export class NetworkManager {
  static cachedIdToken = null

  static apiUrl(apiName) {
    return `${process.env.REACT_APP_BASE_SERVER_URL}/${apiName}`
  }

  static async call(method, path, data = {}, headers = {}) {
    console.log(path)
    const requestConfig = {
      url: `${process.env.REACT_APP_BASE_SERVER_URL}/main/api/v1${path}`,
      method,
      headers,
      data,
    }

    const currUser = auth.currentUser

    if (currUser) {
      // Need to add the idToken
      let idToken

      if (this.cachedIdToken && !isExpired(this.cachedIdToken)) {
        console.log("using cached id token")
        idToken = this.cachedIdToken
      } else {
        console.log("using fresh id token")
        const freshIdToken = await currUser.getIdToken()
        this.cachedIdToken = freshIdToken
        idToken = freshIdToken
      }

      requestConfig.headers["Authorization"] = `Bearer ${idToken}`
    }

    return axios.request(requestConfig)
  }

  static async get(path, data, headers = {}) {
    return this.call("GET", path, data, headers)
  }

  static async post(path, data, headers = {}) {
    return this.call("POST", path, data, headers)
  }

  static async put(path, data, headers = {}) {
    return this.call("PUT", path, data, headers)
  }

  static async delete(path, data, headers = {}) {
    return this.call("DELETE", path, data, headers)
  }
}
