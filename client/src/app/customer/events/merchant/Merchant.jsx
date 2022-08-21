import { useEffect, useState } from "react"
import { Route, Routes, useLocation, useParams } from "react-router-dom"
import LoadingPage from "../../../../components/LoadingPage"
import Collection from "../../../../enums/Collection"
import Event from "../event/Event"
import EventRecurrencePage from "../event/EventRecurrencePage"
import MerchantPage from "./MerchantPage"

export default function Merchant({ user }) {
  const { merchantId } = useParams()
  const { state } = useLocation()
  const [merchant, setMerchant] = useState(state?.merchant)

  useEffect(() => {
    return Collection.MERCHANT.onChange(merchantId, setMerchant)
  }, [merchantId])

  if (merchant) {
    return (
      <Routes>
        <Route
          path="er/:eventRecurrenceId"
          element={<EventRecurrencePage />}
        />
        <Route
          path=":eventId/*"
          element={<Event merchant={merchant} user={user} />}
        />
        <Route path="/" element={<MerchantPage merchant={merchant} />} />
      </Routes>
    )
  } else {
    return <LoadingPage />
  }
}
