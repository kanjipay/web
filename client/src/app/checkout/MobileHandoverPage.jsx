import { onSnapshot } from "firebase/firestore";
import { useEffect } from "react"
import { useNavigate, useParams } from "react-router-dom"
import Tick from "../../assets/icons/Tick";
import { Colors } from "../../components/CircleButton";
import CircleIcon from "../../components/CircleIcon";
import Spacer from "../../components/Spacer";
import Collection from "../../enums/Collection";
import PaymentIntentStatus from "../../enums/PaymentIntentStatus";
import useBasket from "../customer/menu/basket/useBasket";
import { generateRedirectUrl } from "./redirects";

export default function MobileHandoverPage() {
  // Should be polling order for status paid
  const { paymentIntentId } = useParams()
  const navigate = useNavigate()
  const { clearBasket } = useBasket()

  useEffect(() => {
    return onSnapshot(Collection.PAYMENT_INTENT.docRef(paymentIntentId), doc => {
      const paymentIntent = { id: doc.id, ...doc.data() }
      const { status } = paymentIntent

      console.log(`paymentIntent: ${JSON.stringify(paymentIntent)}`)

      if (status !== PaymentIntentStatus.PENDING) {
        const redirectUrl = generateRedirectUrl(status, paymentIntent)
        console.log(`redirectUrl: ${redirectUrl}`)
        window.location.href = redirectUrl
      }
    });
  }, [paymentIntentId, navigate, clearBasket])

  return <div className="container">
    <div className="content">
      <Spacer y={12} />
      <div style={{ maxWidth: 420, margin: "auto", textAlign: "center" }}>
        <CircleIcon 
          Icon={Tick} 
          length={120} 
          style={{ margin: "auto" }}
        />
        <Spacer y={2} />
        <h3 className="header-s">Your mobile is synced</h3>
        <Spacer y={2} />
        <p className="text-body-faded">Don't reload this page. We'll redirect you once you complete your payment on your mobile device.</p>
      </div>
    </div>
  </div>
}