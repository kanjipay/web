import { where } from "firebase/firestore";
import { useEffect, useState } from "react";
import { Routes, useNavigate, useParams } from "react-router-dom";
import LoadingPage from "../../../components/LoadingPage";
import Collection from "../../../enums/Collection";
import { Colors } from "../../../enums/Colors";

export default function EventShortLinks() {
  const { merchantLinkName, eventLinkName } = useParams()
  const navigate = useNavigate()
  const [merchant, setMerchant] = useState(null)
  const [event, setEvent] = useState(null)

  useEffect(() => {
    return Collection.MERCHANT.queryOnChangeGetOne(
      setMerchant,
      where("linkName", "==", merchantLinkName)
    )
  }, [merchantLinkName])

  useEffect(() => {
    if (eventLinkName) {
      return Collection.EVENT.queryOnChangeGetOne(
        setEvent,
        where("linkName", "==", eventLinkName)
      )
    }
  }, [merchantLinkName, eventLinkName])

  useEffect(() => {
    if (!merchant) { return }

    if (eventLinkName) {
      if (event) {
        navigate(`/events/${merchant.id}/${event.id}`, { state: { merchant, event } })
      }
    } else {
      navigate(`/events/${merchant.id}`, { state: { merchant }})
    }

  }, [merchant, event, eventLinkName, navigate])

  return <div style={{ backgroundColor: Colors.OFF_WHITE_LIGHT }}>
    <LoadingPage />
  </div>
}