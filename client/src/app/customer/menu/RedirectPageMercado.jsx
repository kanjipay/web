import { where } from "firebase/firestore"
import { useEffect } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import LoadingPage from "../../../components/LoadingPage"
import Collection from "../../../enums/Collection"
import OrderStatus from "../../../enums/OrderStatus"
import useBasket from "./basket/useBasket"

export default function RedirectPageMercado() {
  const [searchParams] = useSearchParams()
  const paymentIntentId = searchParams.get("paymentIntentId")
  const navigate = useNavigate()
  const { clearBasket } = useBasket()

  useEffect(() => {
    return Collection.ORDER.queryOnChangeGetOne((order) => {
      const { merchantId, status } = order

      switch (status) {
        case OrderStatus.PAID:
          clearBasket()
          navigate(`/menu/orders/${order.id}/confirmation`)

          break
        case OrderStatus.ABANDONED:
          navigate(`/menu/${merchantId}/basket`)
          break
        default:
      }
    }, where("mercado.paymentIntentId", "==", paymentIntentId))
  }, [paymentIntentId, navigate, clearBasket])

  return <LoadingPage />
}
