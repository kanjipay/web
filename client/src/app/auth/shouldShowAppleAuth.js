import { UAParser } from "ua-parser-js"

export function shouldShowAppleAuth() {
  const userAgent = UAParser(navigator.userAgent)

  return ["iOS", "Mac OS"].includes(userAgent.os.name)
}