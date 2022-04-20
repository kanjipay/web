import { updateDoc } from "firebase/firestore";
import Collection from "../../enums/Collection";
import PaymentIntentStatus from "../../enums/PaymentIntentStatus";
import { AnalyticsEvent, AnalyticsManager } from "../../utils/AnalyticsManager";

export async function cancelPaymentIntent(paymentIntent) {
  const paymentIntentId = paymentIntent.id
  const paymentIntentRef = Collection.PAYMENT_INTENT.docRef(paymentIntentId)
  await updateDoc(paymentIntentRef, { status: PaymentIntentStatus.CANCELLED })

  AnalyticsManager.main.logEvent(AnalyticsEvent.ABANDON_ORDER, {
    paymentIntentId,
  });

  return generateRedirectUrl(PaymentIntentStatus.CANCELLED, paymentIntent)
}

export function generateRedirectUrl(paymentIntentStatus, paymentIntent) {
  const { cancelledUrl, successUrl } = paymentIntent.data()
  const clientRedirectUrlString = paymentIntentStatus === PaymentIntentStatus.SUCCESSFUL ? successUrl : cancelledUrl

  const redirectUrl = new URL(clientRedirectUrlString)
  redirectUrl.searchParams.set("paymentIntentId", paymentIntent.id)
  redirectUrl.searchParams.set("status", paymentIntentStatus.toLowerCase())

  return redirectUrl.href
}

