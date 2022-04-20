import { onSnapshot, query, where } from "firebase/firestore";
import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import LoadingPage from "../../components/LoadingPage";
import Collection from "../../enums/Collection";
import OrderStatus from "../../enums/OrderStatus";

export default function RedirectPageMercado() {
  const [searchParams] = useSearchParams();
  const paymentIntentId = searchParams.get("paymentIntentId")
  const navigate = useNavigate()

  useEffect(() => {
    const orderQuery = query(
      Collection.ORDER.ref,
      where("paymentIntentId", "==", paymentIntentId)
    );

    onSnapshot(orderQuery, snapshot => {
      const orders = snapshot.docs.map(doc => {
        return { id: doc.id, ...doc.data() }
      })

      if (orders.length === 0) { return }

      const order = orders[0]
      const basePath = `/orders/${order.id}`

      switch (order.status) {
        case OrderStatus.PAID: 
          navigate(`${basePath}/confirmation`)
          break;
        case OrderStatus.ABANDONED:
          navigate(`${basePath}/abandoned`)
          break;
        default:
      }
    })
  }, [paymentIntentId, navigate])


  return <LoadingPage />
}