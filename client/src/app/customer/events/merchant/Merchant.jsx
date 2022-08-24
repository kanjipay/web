import { useEffect, useState } from "react"
import { Route, Routes, useLocation, useParams } from "react-router-dom"
import Cross from "../../../../assets/icons/Cross"
import IconPage from "../../../../components/IconPage"
import LoadingPage from "../../../../components/LoadingPage"
import Collection from "../../../../enums/Collection"
import { Colors } from "../../../../enums/Colors"
import Event from "../event/Event"
import EventRecurrencePage from "../event/EventRecurrencePage"
import MerchantPage from "./MerchantPage"

export default function Merchant({ user }) {
  const { merchantId } = useParams()
  const { state } = useLocation()
  const [merchant, setMerchant] = useState(state?.merchant)
  const [error, setError] = useState(null)

  useEffect(() => {
    return Collection.MERCHANT.onChange(merchantId, merchant => {
      setMerchant(merchant)

      if (!merchant) {
        setError({
          title: "Organiser not found",
          body: "We couldn't find that organiser. Please double check you have the right link."
        })
      }
    })
  }, [merchantId])

  if (error) {
    return <IconPage
      Icon={Cross}
      iconBackgroundColor={Colors.RED_LIGHT}
      iconForegroundColor={Colors.RED}
      title={error.title}
      body={error.body}
    />
  } else if (merchant) {
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
