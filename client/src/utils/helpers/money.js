export function formatCurrency(int, currencyCode = "GBP", showPence = true) {
  return getCurrencySymbol(currencyCode) + (int / 100).toFixed(showPence ? 2 : 0).toString()
}

const languageCodeToCurrencyCode = {
  "en-gb": "GBP",
  "en-ie": "EUR",
  en: "GBP",
}

const languageCodeToCountryCode = {
  "en-gb": "GB",
  "en-ie": "IE",
  en: "GB",
}

export function getCountryCode(languageCode) {
  return languageCodeToCountryCode[languageCode.toLowerCase()] ?? "GB"
}

const currencyCodeToCurrencySymbol = {
  GBP: "£",
  EUR: "€",
}

export function getCurrencySymbol(currencyCode) {
  return currencyCodeToCurrencySymbol[currencyCode.toUpperCase()] ?? ""
}

export function getCurrencyCode(languageCode) {
  return languageCodeToCurrencyCode[languageCode.toLowerCase()] ?? "EUR"
}
