import { Helmet } from "react-helmet-async"
import AsyncImage from "../../../../components/AsyncImage"
import CircleIcon from "../../../../components/CircleIcon"
import NavBar from "../../../../components/NavBar"
import Spacer from "../../../../components/Spacer"
import { formatMinutes, getWeekdays } from "../../../../utils/helpers/time"
import Clock from "../../../../assets/icons/Clock"
import Location from "../../../../assets/icons/Location"
import "./MerchantAboutPage.css"
import { getMerchantStorageRef } from "../../../../utils/helpers/storage"
import { useParams } from "react-router-dom"
import { useEffect } from "react"
import { AnalyticsManager, PageName } from "../../../../utils/AnalyticsManager"
import { Colors } from "../../../../enums/Colors"

export default function MerchantAboutPage({ merchant, openHourRanges }) {
  const weekdays = getWeekdays("en-GB")
  const { merchantId } = useParams()
  const openingHourGridItems = []

  useEffect(() => {
    AnalyticsManager.main.viewPage(PageName.ABOUT_MERCHANT, { merchantId })
  }, [merchantId])

  openHourRanges
    .sort((range1, range2) => range1.dayOfWeek - range2.dayOfWeek)
    .forEach((range, index) => {
      const weekday = weekdays[range.dayOfWeek - 1]

      openingHourGridItems.push(
        <div
          key={`title-${index}`}
          className="header-xs MerchantAboutPage__dayItem"
        >
          {weekday}
        </div>
      )

      openingHourGridItems.push(
        <div
          key={`hours-${index}`}
          className="text-caption MerchantAboutPage__hoursItem"
        >
          {`${formatMinutes(range.openTime)} - ${formatMinutes(
            range.closeTime
          )}`}
        </div>
      )
    })

  return merchant ? (
    <div className="container">
      <Helmet>
        <title>{merchant.displayName}</title>
      </Helmet>

      <NavBar back=".." transparentDepth={50} opaqueDepth={100} />

      <AsyncImage
        imageRef={getMerchantStorageRef(merchant.id, merchant.photo)}
        className="headerImage"
        alt={merchant.displayName}
      />
      <div className="content">
        <Spacer y={3} />

        <h1 className="header-l">{merchant.displayName}</h1>
        <Spacer y={1} />
        <p className="text-body">{merchant.tags?.join(" · ")}</p>
        <Spacer y={3} />

        <div style={{ display: "flex", alignItems: "center" }}>
          <CircleIcon
            Icon={Location}
            style={{ marginRight: 8 }}
            backgroundColor={Colors.CLEAR}
          />
          <div className="header-s">Address</div>
        </div>
        <Spacer y={2} />
        <p className="text-body-faded">{merchant.address}</p>
        <Spacer y={3} />

        <div style={{ display: "flex", alignItems: "center" }}>
          <CircleIcon
            Icon={Clock}
            style={{ marginRight: 8 }}
            backgroundColor={Colors.CLEAR}
          />
          <div className="header-s">Opening hours</div>
        </div>
        <Spacer y={2} />
        <div className="MerchantAboutPage__openingTimeGrid">
          {openingHourGridItems}
        </div>
        <Spacer y={3} />

        <Spacer y={8} />
      </div>
    </div>
  ) : (
    <div />
  )
}
