import { where } from "firebase/firestore";
import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import LoadingPage from "../../../components/LoadingPage";
import Collection from "../../../enums/Collection";
import OrderStatus from "../../../enums/OrderStatus";

export default function RedirectPageMercado() {
  const [searchParams] = useSearchParams();
  const paymentIntentId = searchParams.get("paymentIntentId")
  const navigate = useNavigate()

  console.log("is running")

  useEffect(() => {
    console.log("paymentIntentId: ", paymentIntentId)
    return Collection.ORDER.queryOnChangeGetOne(order => {
      const { merchantId } = order

      switch (order.status) {
        case OrderStatus.PAID:
          navigate(`/events/s/orders/${order.id}/confirmation`)

          break;
        case OrderStatus.ABANDONED:
          navigate(`/events/${merchantId}/${order.eventId}`)
          break;
        default:
      }
    }, where("mercado.paymentIntentId", "==", paymentIntentId))
  }, [paymentIntentId, navigate])


  return <LoadingPage />
}