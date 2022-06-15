function getCrezcoUserId() {
  const environment = process.env.ENV

  switch (environment) {
    case "STAGING":
      return process.env.PROD_CREZCO_USER_ID
    default:
      return process.env.SANDBOX_CREZCO_USER_ID
  }
}

module.exports = getCrezcoUserId