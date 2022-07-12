import { UAParser } from "ua-parser-js"

export function shouldShowGoogleAuth() {
  const userAgent = UAParser(navigator.userAgent)
  const browser = userAgent.browser.name

  if (["Safari", "Mobile Safari", "Chrome", "Chromium", "Edge", "Brave", "Firefox"].includes(browser)) {
    return true
  }

  return false
}