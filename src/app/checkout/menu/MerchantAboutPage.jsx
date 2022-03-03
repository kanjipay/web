import { Helmet } from "react-helmet";
import { useLocation } from "react-router-dom";
import AsyncImage from "../../../components/AsyncImage";
import CircleIcon from "../../../components/CircleIcon";
import NavBar from "../../../components/NavBar";
import Spacer from "../../../components/Spacer";
import { formatMinutes, getWeekdays } from "../../../utils/helpers/time";
import Clock from '../../../assets/icons/Clock'
import Location from '../../../assets/icons/Location'
import './MerchantAboutPage.css'

export default function MerchantAboutPage({ merchant, openHourRanges }) {
  const weekdays = getWeekdays('en-GB');
  const openingHourGridItems = []

  openHourRanges
    .sort((range1, range2) => range1.day_of_week - range2.day_of_week)
    .forEach((range, index) => {
      console.log("for each loop: ", index)
      const weekday = weekdays[range.day_of_week - 1]

      openingHourGridItems.push(
        <div className="header-xs MerchantAboutPage__dayItem">{weekday}</div>
      )

      openingHourGridItems.push(
        <div className="text-caption MerchantAboutPage__hoursItem">
          {`${formatMinutes(range.open_time)} - ${formatMinutes(range.close_time)}`}
        </div>
      )
    })

  return (
    merchant ?
      <div className="container">
        <Helmet>
          <title>{merchant.display_name}</title>
        </Helmet>

        <NavBar
          transparentDepth={50}
          opaqueDepth={100}
        />

        <AsyncImage
          storagePath={`merchants/${merchant.id}/${merchant.photo}`}
          className='headerImage'
        />
        <div className="content">
          <Spacer y={3} />

          <h1 className="header-l">{merchant.display_name}</h1>
          <Spacer y={1} />
          <p className="text-body">{merchant.tags.join(" · ")}</p>
          <Spacer y={3} />

          <div style={{ display: "flex", alignItems: "center" }}>
            <CircleIcon Icon={Location} style={{ marginRight: 8 }} />
            <div className="header-s">Address</div>
          </div>
          <Spacer y={2} />
          <p className="text-body-faded">{merchant.address}</p>
          <Spacer y={3} />

          <div style={{ display: "flex", alignItems: "center" }}>
            <CircleIcon Icon={Clock} style={{ marginRight: 8 }} />
            <div className="header-s">Opening hours</div>
          </div>
          <Spacer y={2} />
          <div className="MerchantAboutPage__openingTimeGrid">
            { openingHourGridItems }
          </div>
          <Spacer y={3} />

          <p className="text-disclaimer">
            This is a short disclaimer that needs to be here. This is a short disclaimer that needs to be here. This is a short disclaimer that needs to be here. This is a short disclaimer that needs to be here. This is a short disclaimer that needs to be here. This is a short disclaimer that needs to be here. This is a short disclaimer that needs to be here.
          </p>

          <Spacer y={8} />
        </div>
      </div> :
    <div />
  )
}

