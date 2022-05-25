export function formatCurrency(int) {
  if (int === 0) {
    return "Free"
  } else {
    return "£" + (int / 100).toFixed(2).toString();
  }
}
