import Clock from "../../../../assets/icons/Clock";
import User from "../../../../assets/icons/User";
import Location from "../../../../assets/icons/Location";
import AsyncImage from "../../../../components/AsyncImage";
import CircleIcon from "../../../../components/CircleIcon";
import NavBar from "../../../../components/NavBar";
import Spacer from "../../../../components/Spacer";
import { getEventStorageRef } from "../../../../utils/helpers/storage";
import { Link } from "react-router-dom";
import ProductListing from "../product/ProductListing";
import EventsAppNavBar from "../secure/EventsAppNavBar";
import { eventTimeString, generateGoogleMapsLink } from "./eventHelpers";
import { Colors } from "../../../../components/CircleButton";
import ShowMoreText from "react-show-more-text";

export function EventDetails({ event, merchant, artists = [] }) {
  return <div>
    <div style={{ columnGap: 8, display: "flex" }}>
      <CircleIcon Icon={Clock} length={20} backgroundColor={Colors.CLEAR} />
      <p className="text-body">{eventTimeString(event)}</p>
    </div>
    <Spacer y={1} />
    <div style={{ columnGap: 8, display: "flex" }}>
      <CircleIcon Icon={Location} length={20} backgroundColor={Colors.CLEAR} />
      <p className="text-body">
        {`${event.address} · `}
        <a href={generateGoogleMapsLink(event)} target="_blank" rel="noreferrer">Get directions</a>
      </p>
    </div>
    {
      merchant && <div>
        <Spacer y={1} />
        <div style={{ columnGap: 8, display: "flex" }}>
          <CircleIcon Icon={User} length={20} backgroundColor={Colors.CLEAR} />
          <p className="text-body">
            Artists: {
              artists.map(artist => {
                return <span>
                  <Link to={`/events/artists/${artist.id}`}>{artist.name}</Link>
                  {", "}
                </span>
              })
            }
            Organised by <Link to="../..">{merchant.displayName}</Link>
          </p>
        </div>
      </div>
    }
  </div>
}

export default function EventPage({ merchant, event, products }) {
  return <div className="container">
    <EventsAppNavBar
      title={event.title}
      transparentDepth={50}
      opaqueDepth={100}
      backPath="../.."
    />

    <AsyncImage
      imageRef={getEventStorageRef(merchant.id, event.id, event.photo)}
      className="headerImage"
      alt={merchant.displayName}
    />

    <Spacer y={4} />

    <div className="content">
      <h1 className="header-l">{event.title}</h1>
      {
        event.tags && event.tags.length > 0 && <div>
          <Spacer y={2} />
          <div style={{ display: "flex", columnGap: 4 }}>
            {
              event.tags.map(tag => {
                return <p 
                  key={tag} 
                  className="text-body" 
                  style={{ padding: "4px 8px", backgroundColor: Colors.OFF_WHITE_LIGHT }}
                >
                  {tag}
                </p>
              })
            }
          </div>
          
        </div>
      }
      <Spacer y={2} />

      <EventDetails event={event} merchant={merchant} />
      <Spacer y={4} />
      <ShowMoreText
        lines={3}
        className="text-body-faded"
      >
        {event.description}
      </ShowMoreText>
      

      <Spacer y={4} />

      <h1 className="header-m">Get tickets</h1>
      <Spacer y={2} />
      {
        products
          .filter(product => product.isPublished)
          .map(product => {
            return <div key={product.id}>
              <ProductListing product={product} />
              <Spacer y={1} />
            </div>
          })
      }

      <Spacer y={8} />
    </div>
  </div>
}