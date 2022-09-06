import { UAParser } from "ua-parser-js"

export function shouldShowAppleAuth() {
  const userAgent = UAParser(navigator.userAgent)
  const isAppleOS = ["iOS", "Mac OS"].includes(userAgent.os.name)
  const isInIframe = window.location !== window.parent.location

  return isAppleOS && !isInIframe
}
