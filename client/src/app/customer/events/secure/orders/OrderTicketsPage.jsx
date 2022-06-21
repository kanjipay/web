import { useEffect, useState } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import Cross from "../../../../../assets/icons/Cross"
import { Colors } from "../../../../../enums/Colors"
import IconActionPage from "../../../../../components/IconActionPage"
import LoadingPage from "../../../../../components/LoadingPage"
import OrderType from "../../../../../enums/OrderType"
import { AnalyticsEvent, AnalyticsManager } from "../../../../../utils/AnalyticsManager"
import { createTicketOrder } from "../../../../../utils/services/OrdersService"
import { getLatestItem } from "../../../../shared/attribution/AttributionReducer"

export default function OrderTicketsPage() {
  const { state } = useLocation()
  const { eventId, productId, quantity } = state
  const navigate = useNavigate()
  const [error, setError] = useState(null)
  const backPath = state?.backPath ?? "/"

  useEffect(() => {
    AnalyticsManager.main.viewPage("OrderTickets", { productId, quantity })
  }, [productId, quantity])

  useEffect(() => {
    const attributionItem = getLatestItem({ eventId })
    
    createTicketOrder(productId, quantity, attributionItem)
      .then(({ orderId, redirectPath }) => {
        console.log("redirectPath: ", redirectPath)
        AnalyticsManager.main.logEvent(AnalyticsEvent.CREATE_ORDER, { orderId, orderType: OrderType.TICKETS });

        navigate(redirectPath)
      })
      .catch(error => {
        setError({
          title: "The order failed",
          description: error?.response?.data?.error
        })
      })
  }, [productId, quantity, navigate])

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