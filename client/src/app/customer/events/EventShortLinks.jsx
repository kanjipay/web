import { where } from "firebase/firestore";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Cross from "../../../assets/icons/Cross";
import IconPage from "../../../components/IconPage";
import LoadingPage from "../../../components/LoadingPage";
import Collection from "../../../enums/Collection";
import { Colors } from "../../../enums/Colors";

export default function EventShortLinks() {
  const { merchantLinkName, eventLinkName } = useParams()
  const navigate = useNavigate()
  const [merchant, setMerchant] = useState(null)
  const [event, setEvent] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    return Collection.MERCHANT.queryOnChangeGetOne(
      merchant => {
        if (!merchant) {
          setError({ 
            title: "Organiser not found", 
            body: "We couldn't find that organiser. Try double checking your link."
          })
        } else {
          setMerchant(merchant)
        }
      },
      where("linkName", "==", merchantLinkName)
    )
  }, [merchantLinkName])

  useEffect(() => {
    if (!merchant || !eventLinkName) {
      return
    }

    return Collection.EVENT.queryOnChangeGetOne(
      event => {
        if (!event) {
          setError({ 
            title: "Event not found",
            body: "We couldn't find that event. Try double checking your link."
          })
        } else {
          setEvent(event)
        }
      },
      where("linkName", "==", eventLinkName),
      where("merchantId", "==", merchant.id)
    )
  }, [merchantLinkName, eventLinkName, merchant])

  useEffect(() => {
    if (!merchant) { return }

    if (eventLinkName) {
      if (event) {
        navigate(`/events/${merchant.id}/${event.id}`, { state: { merchant, event } })
      }
    } else {
      navigate(`/events/${merchant.id}`, { state: { merchant } })
    }

  }, [merchant, event, eventLinkName, navigate])

  if (error) {
    return <div style={{ backgroundColor: Colors.OFF_WHITE_LIGHT }}>
      <IconPage
        Icon={Cross}
        iconBackgroundColor={Colors.RED_LIGHT}
        iconForegroundColor={Colors.RED}
        title={error.title}
        body={error.body}
      />
    </div>
  } else {
    return <div style={{ backgroundColor: Colors.OFF_WHITE_LIGHT }}>
      <LoadingPage />
    </div>
  }

  
}