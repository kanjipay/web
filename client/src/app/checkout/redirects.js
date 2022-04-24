import axios from "axios";
import PaymentIntentStatus from "../../enums/PaymentIntentStatus";
import { AnalyticsEvent, AnalyticsManager } from "../../utils/AnalyticsManager";

export async function cancelPaymentIntent(paymentIntent) {
  const paymentIntentId = paymentIntent.id
  await axios.put(`${process.env.REACT_APP_BASE_SERVER_URL}/internal/api/v1/payment-intents/${paymentIntentId}/cancel`)

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

