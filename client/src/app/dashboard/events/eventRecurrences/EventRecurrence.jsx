import { where } from "firebase/firestore";
import { useEffect, useState } from "react";
import { Route, Routes, useParams } from "react-router-dom";
import LoadingPage from "../../../../components/LoadingPage";
import Collection from "../../../../enums/Collection";
import CreateProductRecurrencePage from "../productRecurrences/CreateProductRecurrencePage";
import EventRecurrencePage from "./EventRecurrencePage";
import ProductRecurrencePage from "../productRecurrences/ProductRecurrencePage";

export default function EventRecurrence({ eventRecurrences, merchant }) {
  const { eventRecurrenceId, merchantId } = useParams()
  const [productRecurrences, setProductRecurrences] = useState(null)

  const eventRecurrence = eventRecurrences.find(er => er.id === eventRecurrenceId)

  useEffect(() => {
    return Collection.PRODUCT_RECURRENCE.queryOnChange(
      setProductRecurrences,
      where("merchantId", "==", merchantId),
      where("eventRecurrenceId", "==", eventRecurrenceId)
    )
  }, [eventRecurrenceId, merchantId])

  if (eventRecurrence) {
    return <Routes>
      <Route path="/" element={<EventRecurrencePage eventRecurrence={eventRecurrence} productRecurrences={productRecurrences} merchant={merchant} />} />
      <Route path="pr/create" element={<CreateProductRecurrencePage eventRecurrence={eventRecurrence} merchant={merchant} />} />
      <Route path="pr/:productRecurrenceId" element={<ProductRecurrencePage productRecurrences={productRecurrences} eventRecurrence={eventRecurrence} merchant={merchant} />} />
    </Routes>
  } else {
    return <LoadingPage />
  }
}