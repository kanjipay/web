import { getDoc } from "firebase/firestore"
import { useEffect, useState } from "react"
import { Route, Routes, useParams } from "react-router-dom"
import LoadingPage from "../../../../components/LoadingPage"
import Collection from "../../../../enums/Collection"
import Event from "../event/Event"
import MerchantPage from "./MerchantPage"
import ReactPixel from "react-facebook-pixel"

export default function Merchant({ user }) {
  const { merchantId } = useParams()
  console.log(user)
  const [merchant, setMerchant] = useState(null)

  useEffect(() => {
    Collection.MERCHANT.onChange(merchantId, setMerchant)
  }, [merchantId])

  if (merchant) {
    return (
      <Routes>
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
