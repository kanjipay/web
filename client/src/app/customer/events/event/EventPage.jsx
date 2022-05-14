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
import { dateFromTimestamp } from "../../../../utils/helpers/time";
import EventsAppNavBar from "../secure/EventsAppNavBar";
import { eventTimeString, generateGoogleMapsLink } from "./eventHelpers";
import { Colors } from "../../../../components/CircleButton";



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
      <Spacer y={2} />
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
      <Spacer y={1} />
      <div style={{ columnGap: 8, display: "flex" }}>
        <CircleIcon Icon={User} length={20} backgroundColor={Colors.CLEAR} />
        <p className="text-body">Organised by <Link to="../..">{merchant.displayName}</Link></p>
      </div>
      <Spacer y={4} />
      <p className="text-body-faded">{event.description}</p>

      <Spacer y={4} />

      <h1 className="header-m">Get tickets</h1>
      <Spacer y={2} />
      {
        products.map(product => {
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