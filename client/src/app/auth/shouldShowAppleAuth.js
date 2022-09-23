import { UAParser } from "ua-parser-js"

export function shouldShowAppleAuth() {
  const userAgent = UAParser(navigator.userAgent)
  const isAppleOS = ["iOS", "Mac OS"].includes(userAgent.os.name)
  const isInIframe = window.location !== window.parent.location
  const browser = userAgent.browser.name
  const isMetaWebview = ["Instagram", "Facebook"].includes(browser)

  return isAppleOS && !isInIframe && !isMetaWebview
}
