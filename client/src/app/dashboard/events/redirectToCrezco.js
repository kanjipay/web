export const redirectToCrezco = (merchantId) => {
  console.log("????????")
  const redirectUrl = new URL(window.location.href)
  redirectUrl.pathname = `/dashboard/o/${merchantId}/crezco-connected`

  const crezcoRegisteredUrl = new URL(process.env.REACT_APP_CREZCO_REDIRECT)
  crezcoRegisteredUrl.searchParams.append("redirect_uri", redirectUrl.href)

  console.log("huhuhuh")

  window.location.href = crezcoRegisteredUrl.href
}
