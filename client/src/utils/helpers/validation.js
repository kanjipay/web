export function validateEmail(email, requiredDomain = null) {
  // from https://en.wikipedia.org/wiki/Email_address

  const charsInLocalPart = "[a-zA-Z0-9!#$%&'*+-/=?^_`{|}~]"
  const charsInDomain = "[a-z0-9-]"
  const defaultDomainRegex = `(${charsInDomain}{1,63}\.){1,}(${charsInDomain}{1,63}){1}`
  const domainRegex = requiredDomain ? requiredDomain : defaultDomainRegex
  const fullRegex = new RegExp(
    `^(?!.{64,})((${charsInLocalPart}+\.){0,5}(${charsInLocalPart}+){1})@${domainRegex}$`
  )

  return fullRegex.test(email)
}

export function validatePassword(password) {
  return /^(?=.*[a-z]+)(?=.*[A-Z]+)(?=.*[0-9]+)([a-zA-Z0-9]{8,100})/.test(
    password
  )
}
export function validateBankAccountNumber(bankAccountNumber) {
  return /^(\d){7,8}$/.test(bankAccountNumber)
}

export function validateSortCode(sortCode) {
  return /^(\d){6}$/.test(sortCode)
}
