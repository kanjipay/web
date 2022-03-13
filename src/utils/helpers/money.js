export function formatCurrency(int) {
  console.log("format: ", int)
  return "£" + (int / 100).toFixed(2).toString()
}