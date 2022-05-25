export function formatCurrency(int: number) {
  return "£" + (int / 100).toFixed(2).toString();
}