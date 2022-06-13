import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import LoadingPage from "../../../components/LoadingPage";
import Collection from "../../../enums/Collection";
import { AnalyticsManager } from "../../../utils/AnalyticsManager";
import useAttribution from "./useAttribution";

export default function AttributionLinkPage() {
  const { attributionLinkId } = useParams()
  const navigate = useNavigate()
  const { addItem } = useAttribution()

  useEffect(() => {
    AnalyticsManager.main.viewPage("AttributionLink", { attributionLinkId })
  }, [attributionLinkId])

  useEffect(() => {
    Collection.ATTRIBUTION_LINK.get(attributionLinkId).then(attributionLink => {
      const { path, attributionData, createdAt, id, displayName, ...productData } = attributionLink

      addItem({
        attributionData,
        ...productData
      })

      navigate(path)
    })

  }, [attributionLinkId, navigate, addItem])

  return <LoadingPage />
}