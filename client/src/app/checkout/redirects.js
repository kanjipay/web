import PaymentIntentStatus from "../../enums/PaymentIntentStatus";
import { AnalyticsEvent, AnalyticsManager } from "../../utils/AnalyticsManager";
import { ApiName, NetworkManager } from "../../utils/NetworkManager";

export async function cancelPaymentIntent(paymentIntent) {
  const paymentIntentId = paymentIntent.id
  await NetworkManager.put(ApiName.INTERNAL, `/payment-intents/${paymentIntentId}/cancel`, {
    cancelReason: "USER"
  })

  AnalyticsManager.main.logEvent(AnalyticsEvent.ABANDON_ORDER, {
    paymentIntentId,
  });

  return generateRedirectUrl(PaymentIntentStatus.CANCELLED, paymentIntent)
}

export function generateRedirectUrl(paymentIntentStatus, paymentIntent) {
  const { cancelledUrl, successUrl } = paymentIntent
  const clientRedirectUrlString = paymentIntentStatus === PaymentIntentStatus.SUCCESSFUL ? successUrl : cancelledUrl

  const redirectUrl = new URL(clientRedirectUrlString)
  redirectUrl.searchParams.set("paymentIntentId", paymentIntent.id)
  redirectUrl.searchParams.set("status", paymentIntentStatus.toLowerCase())
  console.log("Redirect to: ", redirectUrl.href)

  return redirectUrl.href
}

