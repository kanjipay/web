import { useEffect, useState } from "react";
import { Route, Routes, useParams } from "react-router-dom";
import LoadingPage from "../../components/LoadingPage";
// import PaymentMethodPage from "./PaymentMethodPage";
import ConfirmBankPage from "./ConfirmBankPage";
import PaymentCancelledPage from "./PaymentCancelledPage";
import PaymentFailurePage from "./PaymentFailurePage";
import ChooseBankPage from "./ChooseBankPage";
import PaymentPageMoneyhub from "./PaymentPageMoneyhub";
import MobileHandoverPage from "./MobileHandoverPage";
import { onSnapshot } from "firebase/firestore";
import Collection from "../../enums/Collection";
import MobileFinishedPage from "./MobileFinishedPage";

export default function Checkout() {
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
      <Route path="payment" element={<PaymentPageMoneyhub paymentIntent={paymentIntent} />} />
      <Route path="choose-bank" element={<ChooseBankPage paymentIntent={paymentIntent} />} />
      <Route path="confirm-bank" element={<ConfirmBankPage paymentIntent={paymentIntent} />} />
      <Route path="confirm-bank/:bankId" element={<ConfirmBankPage paymentIntent={paymentIntent} />} />
      <Route path="mobile-handover" element={<MobileHandoverPage paymentIntent={paymentIntent} />} />
      <Route path="mobile-finished" element={<MobileFinishedPage />} />
      <Route path="payment-failure" element={<PaymentFailurePage paymentIntent={paymentIntent} />} />
      <Route path="payment-cancelled" element={<PaymentCancelledPage paymentIntent={paymentIntent} />} />
    </Routes> :
    <LoadingPage />
}
