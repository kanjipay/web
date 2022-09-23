import { useEffect } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import LoadingPage from "../../../../components/LoadingPage";
import { IdentityManager } from "../../../../utils/IdentityManager";
import { NetworkManager } from "../../../../utils/NetworkManager";
import { MarketingConsent, setMarketingConsent } from "../../../../utils/services/UsersService";
import { getLatestItem } from "../../../shared/attribution/AttributionReducer";
import { v4 as uuid } from "uuid"
import { useOpenErrorPage } from "../../../../utils/useOpenErrorPage";
import { useState } from "react";
import { AnalyticsManager } from "../../../../utils/AnalyticsManager";

export default function ProductRedirectPage({ product, event, merchant, user }) {
  const { pathname, state } = useLocation()
  const { eventId, productId, merchantId } = useParams()
  const navigate = useNavigate()
  const openErrorPage = useOpenErrorPage()
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false)

  useEffect(() => {
    AnalyticsManager.main.viewPage("ProductRedirect", { productId, eventId, merchantId: merchantId })
  }, [productId, eventId, merchantId])

  useEffect(() => {
    if (!state || isSubmittingOrder) { return }

    setIsSubmittingOrder(true)

    const { checkoutUrlType, marketingConsentStatus, quantity } = state

    if (checkoutUrlType && user) {
      if (!user.marketingConsentStatus || user.marketingConsentStatus === MarketingConsent.PENDING) {
        setMarketingConsent(marketingConsentStatus).then(() => { })
      }

      const deviceId = IdentityManager.main.getDeviceId()
      const attributionItem = getLatestItem({ eventId })
      const orderId = uuid()

      let redirectPath

      switch (checkoutUrlType) {
        case "FREE":
          redirectPath = `/events/s/orders/${orderId}/confirmation`
          break;
        case "CARD":
          redirectPath = `/checkout/o/${orderId}/payment-stripe`
          break;
        case "OPEN_BANKING":
          redirectPath = `/checkout/o/${orderId}/choose-bank`
          break;
        default:
          redirectPath = `/checkout/o/${orderId}/payment-stripe`
      }

      NetworkManager.post("/orders/tickets", {
        orderId,
        productId,
        quantity,
        deviceId,
        attributionData: attributionItem?.attributionData,
      }).then(() => {
        NetworkManager.put(`/orders/o/${orderId}/enrich`, { locale: navigator.language }).then(() => { })
        navigate(redirectPath)
      })
        .catch((error) => {
          openErrorPage({
            title: "The order failed",
            description: error?.response?.data?.message,
          })
        })

      if (checkoutUrlType !== "FREE") {
        navigate(redirectPath, {
          state: {
            shouldEmphasiseOpenBanking: merchant?.openBankingSettings ? merchant.openBankingSettings === "ON" : true
          }
        })
      }
    }
  }, [state, eventId, merchant, event, product, navigate, pathname, productId, user, openErrorPage, isSubmittingOrder])

  return <LoadingPage />
}