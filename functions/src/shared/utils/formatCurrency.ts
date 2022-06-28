export function formatCurrency(int: number, currencyCode: string) {
  return currencySymbol(currencyCode) + (int / 100).toFixed(2).toString();
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