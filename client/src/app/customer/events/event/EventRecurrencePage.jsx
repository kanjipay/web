import { limit, orderBy, where } from "firebase/firestore";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import LoadingPage from "../../../../components/LoadingPage";
import Collection from "../../../../enums/Collection";

export default function EventRecurrencePage() {
  const { eventRecurrenceId } = useParams()
  const navigate = useNavigate()
  const [event, setEvent] = useState(null)

  useEffect(() => {
    return Collection.EVENT.queryOnChangeGetOne(
      setEvent,
      where("eventRecurrenceId", "==", eventRecurrenceId),
      where("isPublished", "==", true),
      orderBy("startsAt", "asc"),
      limit(1)
    )
  }, [eventRecurrenceId])

  useEffect(() => {
    if (event) {
      const { id: eventId, merchantId } = event
      navigate(`/events/${merchantId}/${eventId}`)
    }
  }, [event, navigate])

  return <LoadingPage />
}