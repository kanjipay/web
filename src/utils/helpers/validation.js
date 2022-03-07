export function validateEmail(value) {
  return /\S+@\S+\.\S+/.test(value)
}