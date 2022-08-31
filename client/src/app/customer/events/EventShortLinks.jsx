import { where } from "firebase/firestore";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Cross from "../../../assets/icons/Cross";
import IconPage from "../../../components/IconPage";
import Spacer from "../../../components/Spacer";
import Collection from "../../../enums/Collection";
import { Colors } from "../../../enums/Colors";
import { ShimmerThumbnail, ShimmerTitle, ShimmerText, ShimmerButton } from "react-shimmer-effects";
import useWindowSize from "../../../utils/helpers/useWindowSize";
import EventsAppNavBar from "./secure/EventsAppNavBar";
import Spinner from "../../../assets/Spinner";

export default function EventShortLinks() {
  const { merchantLinkName, eventLinkName } = useParams()
  const navigate = useNavigate()
  const [merchant, setMerchant] = useState(null)
  const [event, setEvent] = useState(null)
  const [error, setError] = useState(null)

  const { width } = useWindowSize()
  const contentWidth = Math.min(width, 500)
  const headerImageHeight = eventLinkName ? contentWidth : contentWidth / 2

  useEffect(() => {
    return Collection.MERCHANT.queryOnChangeGetOne(
      merchant => {
        setMerchant(merchant)

        if (!merchant) {
          setError({ 
            title: "Organiser not found", 
            body: "We couldn't find that organiser. Try double checking your link."
          })
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
        setEvent(event)

        if (!event) {
          setError({ 
            title: "Event not found",
            body: "We couldn't find that event. Try double checking your link."
          })
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
      <div className="container">
        <EventsAppNavBar
          title={<Spinner length={20} />}
          transparentDepth={headerImageHeight - 96}
          opaqueDepth={headerImageHeight - 48}
          back="../.."
        />
        <ShimmerThumbnail height={headerImageHeight} />
        <Spacer y={3} />
        <div className="content">
          {
            eventLinkName ?
              <div>
                <ShimmerTitle />
                <div style={{ display: "flex", columnGap: 8 }}>
                  <ShimmerButton size="sm" />
                  <ShimmerButton size="sm" />
                  <ShimmerButton size="sm" />
                </div>
                <Spacer y={2} />
                <ShimmerText line={3} />
                <Spacer y={4} />
                <ShimmerText />
                <Spacer y={4} />
                <ShimmerThumbnail height={90} />
                <Spacer y={4} />
                <h2 className="header-m" id="get-tickets">Get tickets</h2>
                <Spacer y={2} />
                <ShimmerThumbnail height={60} rounded={true} />
                <ShimmerThumbnail height={60} rounded={true} />
                <ShimmerThumbnail height={60} rounded={true} />
              </div> :
              <div>
                <ShimmerTitle />
                <Spacer y={3} />
                <ShimmerText />
                <Spacer y={4} />
                <h2 className="header-m">Upcoming events</h2>
                <Spacer y={2} />
                <ShimmerThumbnail height={headerImageHeight - 32} rounded={true} />
                <ShimmerText line={2} />
                <Spacer y={3} />

                <h2 className="header-m">Past events</h2>
                <Spacer y={2} />
                <ShimmerThumbnail height={headerImageHeight - 32} rounded={true} />
                <ShimmerText line={2} />
              </div>
          }
          <Spacer y={8} />
        </div>
      </div>
    </div>
  }
}