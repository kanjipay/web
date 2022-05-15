export function validateEmail(value) {
  return /\S+@\S+\.\S+/.test(value);
}

export function validatePassword(password) {
  return /^(?=.*[a-z]+)(?=.*[A-Z]+)(?=.*[0-9]+)([a-zA-Z0-9]{8,100})/.test(password)
}
