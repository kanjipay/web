import { useEffect, useState } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import Cross from "../../../../../assets/icons/Cross"
import { Colors } from "../../../../../components/CircleButton"
import IconActionPage from "../../../../../components/IconActionPage"
import LoadingPage from "../../../../../components/LoadingPage"
import OrderType from "../../../../../enums/OrderType"
import { AnalyticsEvent, AnalyticsManager } from "../../../../../utils/AnalyticsManager"
import { createTicketOrder } from "../../../../../utils/services/OrdersService"

export default function OrderTicketsPage() {
  const { state } = useLocation()
  const navigate = useNavigate()
  const [error, setError] = useState(null)
  const backPath = state?.backPath ?? "/"

  useEffect(() => {
    if (!state) { 
      setError({
        title: "Something went wrong",
        description: "Please try again later."
      })
      return
    }
    
    const { productId, quantity } = state

    createTicketOrder(productId, quantity)
      .then(data => {
        const { redirectUrl, orderId } = data
        AnalyticsManager.main.logEvent(AnalyticsEvent.CREATE_ORDER, { orderId, orderType: OrderType.TICKETS });
        window.location.href = redirectUrl
      })
      .catch(error => {
        setError({
          title: "The order failed",
          description: error?.response?.data?.error
        })
      })
  }, [state])

  const handleError = () => {
    navigate(backPath)
  }

  if (error) {
    return <IconActionPage
      Icon={Cross}
      iconBackgroundColor={Colors.RED_LIGHT}
      iconForegroundColor={Colors.RED}
      title={error.title}
      body={error.description}
      primaryActionTitle="Go back"
      primaryAction={handleError}
    />
  } else {
    return <LoadingPage />
  } 
}