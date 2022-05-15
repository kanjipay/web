export function validateEmail(value) {
  return /\S+@\S+\.\S+/.test(value);
}
export function validateBankAccountNumber(bankAccountNumber){
  return /^(\d){7,8}$/.test(bankAccountNumber);
}

export function validateSortCode(sortCode){
  return /^(\d){6}$/.test(sortCode);
}