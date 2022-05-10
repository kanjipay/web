import { onSnapshot, query, where } from "firebase/firestore";
import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import LoadingPage from "../../../components/LoadingPage";
import Collection from "../../../enums/Collection";
import OrderStatus from "../../../enums/OrderStatus";
import useBasket from "./basket/useBasket"

export default function RedirectPageMercado() {
  const [searchParams] = useSearchParams();
  const paymentIntentId = searchParams.get("paymentIntentId")
  const navigate = useNavigate()
  const { clearBasket } = useBasket()

  useEffect(() => {
    const orderQuery = query(
      Collection.ORDER.ref,
      where("mercado.paymentIntentId", "==", paymentIntentId)
    );

    onSnapshot(orderQuery, snapshot => {
      const orders = snapshot.docs.map(doc => {
        return { id: doc.id, ...doc.data() }
      })

      if (orders.length === 0) { return }

      const order = orders[0]
      const { merchantId } = order

      switch (order.status) {
        case OrderStatus.PAID: 
          clearBasket()
          navigate(`/menu/orders/${order.id}/confirmation`)
          
          break;
        case OrderStatus.ABANDONED:
          navigate(`/menu/${merchantId}/basket`)
          break;
        default:
      }
    })
  }, [paymentIntentId, navigate, clearBasket])


  return <LoadingPage />
}