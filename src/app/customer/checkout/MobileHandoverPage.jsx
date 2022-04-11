import { onSnapshot } from "firebase/firestore";
import { useEffect } from "react"
import { useNavigate, useParams } from "react-router-dom"
import Tick from "../../../assets/icons/Tick";
import { Colors } from "../../../components/CircleButton";
import CircleIcon from "../../../components/CircleIcon";
import Spacer from "../../../components/Spacer";
import Collection from "../../../enums/Collection";
import OrderStatus from "../../../enums/OrderStatus";
import useBasket from "../basket/useBasket";

export default function MobileHandoverPage() {
  // Should be polling order for status paid
  const { orderId } = useParams()
  const navigate = useNavigate()
  const { clearBasket } = useBasket()

  useEffect(() => {
    return onSnapshot(Collection.ORDER.docRef(orderId), doc => {
      const { status, merchantId } = doc.data()

      // Order can only ever be PENDING, PAID or ABANDONED here
      // If pending, stay on this page
      // If paid, go to payment success page
      // If abandoned, user will have had to have exited the checkout flow on mobile, so redirect them to the merchant's menu
      // FULFILLED and CANCELLED statuses are only possible after the customer pays

      switch (status) {
        case OrderStatus.PAID:
          clearBasket()
          navigate("../payment-success")
          break;
        case OrderStatus.ABANDONED:
          navigate(`/menu/${merchantId}`)
          break;
        default:
          
      }
    });
  }, [orderId, navigate, clearBasket])

  return <div className="container">
    <div className="content">
      <Spacer y={12} />
      <div style={{ maxWidth: 420, margin: "auto", textAlign: "center" }}>
        <CircleIcon 
          Icon={Tick} 
          length={120} 
          backgroundColor={Colors.PRIMARY_LIGHT} 
          foregroundColor={Colors.PRIMARY}
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