export function formatCurrency(int: number, currencyCode: string) {
  if (int === 0) {
    return "Free"
  } else {
    return currencySymbol(currencyCode) + (int / 100).toFixed(2).toString();
  }
}

export function currencySymbol(currencyCode: string) {
  switch (currencyCode) {
    case "GBP":
      return "£"
    case "EUR":
      return "€"
    default:
      return ""
  }
}