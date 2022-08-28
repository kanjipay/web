import { useEffect, useState } from "react"
import { Route, Routes, useNavigate, useParams } from "react-router-dom"
import LoadingPage from "../../components/LoadingPage"
import PaymentCancelledPage from "./PaymentCancelledPage"
import PaymentFailurePage from "./PaymentFailurePage"
import MobileHandoverPage from "./MobileHandoverPage"
import Collection from "../../enums/Collection"
import MobileFinishedPage from "./MobileFinishedPage"
import ChooseBankCrezcoPage from "./ChooseBankCrezcoPage"
import PaymentPageCrezco from "./PaymentPageCrezco"
import PaymentPageStripe from "./PaymentPageStripe"
import { differenceInSeconds, format } from "date-fns"
import { dateFromTimestamp } from "../../utils/helpers/time"
import { addMinutes } from "date-fns/esm"
import IconActionPage from "../../components/IconActionPage"
import Clock from "../../assets/icons/Clock"
import { Colors } from "../../enums/Colors"
import { cancelOrder } from "./cancelOrder"

export function CheckoutCounter({ order }) {
  const navigate = useNavigate()
  const [isReserved, setIsReserved] = useState(true)
  const [secondsLeftInReservation, setSecondsLeftInReservation] = useState(599)

  useEffect(() => {
    const reservationEndDate = addMinutes(dateFromTimestamp(order.createdAt), 10)

    const interval = setInterval(() => {
      const currentDate = new Date()

      if (currentDate < reservationEndDate) {
        const secondsToReservationEnd = differenceInSeconds(reservationEndDate, currentDate)
        console.log(secondsToReservationEnd)
        setSecondsLeftInReservation(secondsToReservationEnd)
      } else {
        clearInterval(interval)
        setIsReserved(false)
      }
    }, 1000)

    return () => {
      clearInterval(interval)
    }
  }, [order.createdAt])

  const handleRefreshOrder = async () => {
    await cancelOrder(order.id, navigate)
  }

  if (isReserved) {
    return <div className="anchored-bottom" style={{ textAlign: "center", zIndex: 100 }}>
      <div style={{ 
        color: Colors.WHITE,
        backgroundColor: Colors.OFF_BLACK_LIGHT,
        padding: "8px 12px 4px 12px",
        margin: "auto",
        display: "inline-block",
        borderRadius: "16px 16px 0 0"
       }}>
        Order reserved until {format(secondsLeftInReservation * 1000, "mm:ss")}
      </div>
    </div>
  } else {
    return <IconActionPage 
      style={{ position: "fixed", zIndex: 100, width: "100%", height: "100%" }}
      Icon={Clock}
      iconBackgroundColor={Colors.OFF_WHITE_LIGHT}
      iconForegroundColor={Colors.BLACK}
      title="Order timed out"
      body="Your order is no longer reserved, but you can refresh it and start again."
      primaryAction={handleRefreshOrder}
      primaryActionTitle="Refresh order"
    />
  }
}

export default function Order() {
  const [order, setOrder] = useState(null)
  const { orderId } = useParams()

  useEffect(() => {
    return Collection.ORDER.onChange(orderId, setOrder)
  }, [orderId])

  return order ? (
    <Routes>
      <Route path="payment" element={<PaymentPageCrezco order={order} />} />
      <Route
        path="payment-stripe"
        element={<PaymentPageStripe order={order} />}
      />
      <Route
        path="choose-bank"
        element={<ChooseBankCrezcoPage order={order} />}
      />
      <Route
        path="mobile-handover"
        element={<MobileHandoverPage order={order} />}
      />
      <Route path="mobile-finished" element={<MobileFinishedPage />} />
      <Route
        path="payment-failure"
        element={<PaymentFailurePage order={order} />}
      />
      <Route
        path="payment-cancelled"
        element={<PaymentCancelledPage order={order} />}
      />
    </Routes>

  ) : (
    <LoadingPage />
  )
}
