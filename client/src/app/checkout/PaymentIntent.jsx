import { useEffect, useState } from "react";
import { Route, Routes, useParams } from "react-router-dom";
import LoadingPage from "../../components/LoadingPage";
import PaymentCancelledPage from "./PaymentCancelledPage";
import PaymentFailurePage from "./PaymentFailurePage";
import PaymentPageMoneyhub from "./PaymentPageMoneyhub";
import MobileHandoverPage from "./MobileHandoverPage";
import { onSnapshot } from "firebase/firestore";
import Collection from "../../enums/Collection";
import MobileFinishedPage from "./MobileFinishedPage";
import ChooseBankCrezcoPage from "./ChooseBankCrezcoPage";
import PaymentPageCrezco from "./PaymentPageCrezco";
import ChooseBankMoneyhubPage from "./ChooseBankMoneyhubPage";

export default function PaymentIntent() {
  const [paymentIntent, setPaymentIntent] = useState(null);
  const { paymentIntentId } = useParams()

  useEffect(() => {
    const unsub = onSnapshot(Collection.PAYMENT_INTENT.docRef(paymentIntentId), doc => {
      const paymentIntent = { id: doc.id, ...doc.data() }
      setPaymentIntent(paymentIntent);
    })

    return unsub
  }, [paymentIntentId]);

  return paymentIntent ? 
    <Routes>
      {/* Crezco */}
      <Route path="payment" element={<PaymentPageCrezco paymentIntent={paymentIntent} />} />
      <Route path="choose-bank" element={<ChooseBankCrezcoPage paymentIntent={paymentIntent} />} />

      {/* Moneyhub */}
      {/* <Route path="choose-bank" element={<ChooseBankMoneyhubPage paymentIntent={paymentIntent} />} />
      <Route path="payment" element={<PaymentPageMoneyhub paymentIntent={paymentIntent} />} /> */}

      <Route path="mobile-handover" element={<MobileHandoverPage paymentIntent={paymentIntent} />} />
      <Route path="mobile-finished" element={<MobileFinishedPage />} />
      <Route path="payment-failure" element={<PaymentFailurePage paymentIntent={paymentIntent} />} />
      <Route path="payment-cancelled" element={<PaymentCancelledPage paymentIntent={paymentIntent} />} />
    </Routes> :
    <LoadingPage />
}
