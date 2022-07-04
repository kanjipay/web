import { where } from "firebase/firestore";
import { useEffect, useState } from "react";
import { Route, Routes, useParams } from "react-router-dom";
import LoadingPage from "../../../components/LoadingPage";
import Collection from "../../../enums/Collection";
import Event from "../event/Event";
import SelectEventPage from "./SelectEventPage";

export default function Merchant() {
  const { merchantId } = useParams()
  const [merchant, setMerchant] = useState(null)
  const [events, setEvents] = useState(null)

  useEffect(() => Collection.MERCHANT.onChange(merchantId, setMerchant), [merchantId])

  useEffect(() => {
    Collection.EVENT.queryOnChange(
      setEvents,
      where("merchantId", "==", merchantId)
    )
  }, [merchantId])

  return merchant && events ? 
    <Routes>
      <Route path="/" element={<SelectEventPage merchant={merchant} events={events} />} />
      <Route path=":eventId/*" element={<Event events={events} merchant={merchant} />} />
    </Routes> :
    <LoadingPage />
}