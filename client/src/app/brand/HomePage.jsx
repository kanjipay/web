import { useEffect, useState } from "react"
import { Helmet } from "react-helmet-async"
import { useParams } from "react-router-dom"
import { Colors } from "../../enums/Colors"
import Spacer from "../../components/Spacer"
import useWindowSize from "../../utils/helpers/useWindowSize"
import NotFound from "../shared/NotFoundPage"
import * as pluralize from "pluralize"
import MainButton from "../../components/MainButton"
import { ButtonTheme } from "../../components/ButtonTheme"
import Collection from "../../enums/Collection"
import { limit, orderBy, where } from "firebase/firestore"
import EventListing from "../customer/events/event/EventListing"
import { AnalyticsEvent, AnalyticsManager } from "../../utils/AnalyticsManager"

class CustomerSegment {
  constructor(id, displayName, headerPhoto, screenshotPhoto, photo1, photo2) {
    this.id = id
    this.displayName = displayName
    this.headerPhoto = headerPhoto
    this.screenshotPhoto = screenshotPhoto
    this.photo1 = photo1
    this.photo2 = photo2
  }

  static GENERAL = new CustomerSegment(
    "general",
    null,
    "club_floor.jpg",
    "festival_event_mockup.png",
    "women_talking.jpg",
    "festival_crowd.jpg"
  )

  static NIGHTLIFE = new CustomerSegment(
    "nightlife",
    "nightlife event",
    "club_floor.jpg",
    "club_event_mockup.png",
    "women_talking.jpg",
    "dj_deck.jpg"
  )

  static STUDENTS = new CustomerSegment(
    "students",
    "student event",
    "student_crowd.jpg",
    "student_event_mockup.png",
    "student_woman.jpg",
    "dj_deck.jpg"
  )

  static FESTIVALS = new CustomerSegment(
    "festivals",
    "festival",
    "festival_stage.jpg",
    "festival_event_mockup.png",
    "festival_woman.jpg",
    "color_festival.jpg"
  )

  static INTEREST = new CustomerSegment(
    "interest",
    "interest group",
    "conference_crowd.jpg",
    "club_event_mockup.png",
    "conference_woman.jpg",
    "conference_hall.jpg"
  )

  static CONFERENCE = new CustomerSegment(
    "conferences",
    "conference",
    "conference_crowd.jpg",
    "conference_event_mockup.png",
    "conference_woman.jpg",
    "conference_hall.jpg"
  )

  static all() {
    return [
      CustomerSegment.GENERAL,
      CustomerSegment.NIGHTLIFE,
      CustomerSegment.STUDENTS,
      CustomerSegment.FESTIVALS,
      CustomerSegment.INTEREST,
      CustomerSegment.CONFERENCE,
    ]
  }
}

export default function HomePage() {
  const { width } = useWindowSize()
  const isMobile = width < 750

  const { customerSegmentId } = useParams()

  const [customerSegment, setCustomerSegment] = useState(
    CustomerSegment.GENERAL
  )

  useEffect(() => {
    AnalyticsManager.main.viewPage("Home")
  }, [])

  const [events, setEvents] = useState([])

  useEffect(() => {
    return Collection.EVENT.queryOnChange(
      setEvents,
      where("isPublished", "==", true),
      where("startsAt", ">", new Date()),
      orderBy("startsAt", "asc"),
      limit(3)
    )
  }, [])

  useEffect(() => {
    if (customerSegmentId) {
      const segment = CustomerSegment.all().find(
        (s) => s.id === customerSegmentId
      )
      setCustomerSegment(segment)
    }
  }, [customerSegmentId])

  if (!customerSegment) {
    return <NotFound />
  }

  let headline = "The smart events management platform"

  if (customerSegment.displayName) {
    headline += ` for ${pluralize(customerSegment.displayName)}`
  }

  const secondSectionImage = (
    <SquareImage src={`/img/${customerSegment.photo1}`} />
  )

  const secondSectionCopy = (
    <SquareTitleBody
      title="Simple, fair pricing"
      body="Our industry-leading low fee means you can spend more of your budget on making your event great. And unlike other platforms, you'll get revenue from ticket sales upfront."
    />
  )

  const calendlyLink = "https://calendly.com/matt-at-mercado/demo"

  return (
    <div>
      <Helmet>
        <title>The smart events management platform | Mercado</title>
      </Helmet>
      <div
        style={{
          width: "100vw",
          height: "100vh",
          position: "relative",
        }}
      >
        <img
          alt=""
          src={`/img/${customerSegment.headerPhoto}`}
          style={{
            backgroundColor: Colors.BLACK,
            width: "100%",
            height: "100%",
            position: "absolute",
            objectFit: "cover",
          }}
        />
        <div
          style={{
            position: "absolute",
            backgroundColor: "#00000080",
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxSizing: "border-box",
          }}
        ></div>
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: isMobile ? "100%" : 800,
            padding: isMobile ? "0 16px" : 0,
            boxSizing: "border-box",
          }}
        >
          <h1
            style={{
              color: Colors.WHITE,
              fontFamily: "Rubik, Roboto, sans-serif",
              fontWeight: 700,
              maxWidth: 800,
              fontSize: isMobile ? "3em" : "4em",
              textAlign: "center",
              width: "100%",
            }}
          >
            {headline}
          </h1>
          <Spacer y={6} />
          <a href={calendlyLink} target="_blank" rel="noreferrer">
            <MainButton
              title="Book a demo"
              buttonTheme={ButtonTheme.MONOCHROME_REVERSED}
              style={{ width: 200, margin: "auto" }}
            />
          </a>
        </div>
      </div>
      <div>
        <div
          style={{
            maxWidth: 1200,
            margin: "auto",
            padding: "64px 16px",
          }}
        >
          <h2
            style={{
              fontFamily: "Rubik, Roboto, sans-serif",
              fontWeight: 700,
              fontSize: isMobile ? "2em" : "3em",
              margin: "auto",
              color: Colors.BLACK,
            }}
          >
            What's on
          </h2>
          <Spacer y={4} />
          <div style={{ display: isMobile ? "block" : "flex", columnGap: 24 }}>
            {events.map((event) => {
              const listing = (
                <EventListing
                  key={event.id}
                  event={event}
                  style={{ width: isMobile ? "auto" : "calc(33% - 16px)" }}
                  linkPath={`/events/${event.merchantId}/${event.id}`}
                />
              )

              if (isMobile) {
                return (
                  <div>
                    {listing}
                    <Spacer y={3} />
                  </div>
                )
              } else {
                return listing
              }
            })}
            <div></div>
          </div>
        </div>
      </div>
      <div style={{ backgroundColor: Colors.OFF_WHITE_LIGHT, padding: `${isMobile ? "32px" : "128px"} ${isMobile ? "16px" : "0px"}`, boxSizing: "border-box" }}>
        <div style={{ maxWidth: 600, margin: "auto", padding: "32px 48px", position: "relative" }}>
          <p style={{ position: "absolute", top: 0, left: 0, fontSize: 120, fontWeight: 600, fontFamily: "Roboto, sans-serif" }}>"</p>
          <p style={{ fontSize: isMobile ? "1.25em" : "1.5em" }}>
            Between being open to feedback, constantly providing solutions and always working around us, Mercado is by far the most considerate ticketing platform we've worked with to date. We feel the Mercado team are onto something special with their service and plan to continue working with them for our future events.
          </p>
          <p style={{ position: "absolute", bottom: 0, right: 0, fontSize: 120, fontWeight: 600 }}>"</p>
          <Spacer y={2} />
          <div style={{ display: "flex", alignItems: "center", columnGap: 12 }}>
            <img alt="house of hibernia" src="/img/hibernia.jpeg" style={{ borderRadius: 24, height: 48, width: 48 }}/>
            <p style={{ color: Colors.GRAY_LIGHT, fontSize: isMobile ? "1.1em" : "1.25em" }}>House of Hibernia</p>
          </div>
        </div>
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
        }}
      >
        <div
          style={{
            aspectRatio: isMobile ? "auto" : "1/1",
            overflow: "hidden",
            backgroundColor: Colors.BLACK,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 32,
          }}
        >
          <img
            src={`/img/${customerSegment.screenshotPhoto}`}
            alt=""
            style={{ width: isMobile ? "100%" : "50%" }}
          />
        </div>
        <SquareTitleBody
          title="Create. Sell. Manage."
          body="An easy, customisable events platform, fully integrated with social media. Create events, share the link with customers, accept payments, and manage QR code tickets, all from your dashboard."
        />

        {isMobile ? secondSectionImage : secondSectionCopy}

        {isMobile ? secondSectionCopy : secondSectionImage}

        <SquareImage src={`/img/${customerSegment.photo2}`} />
        <SquareTitleBody
          title="Advanced marketing analytics"
          body="View your ticket sales by event, promoter, ticket type, social media post and more. Drive sales with email and social media retargeting."
        />
      </div>

      <div
        style={{
          textAlign: "center",
          backgroundColor: Colors.OFF_BLACK,
          padding: "128px 0px",
        }}
      >
        <h2
          style={{
            width: isMobile ? "auto" : "60%",
            color: Colors.WHITE,
            fontFamily: "Rubik, Roboto, sans-serif",
            fontWeight: 700,
            fontSize: isMobile ? "3em" : "4em",
            margin: "auto",
          }}
        >
          Learn more about our product
        </h2>
        <Spacer y={4} />
        <a href={calendlyLink} target="_blank" rel="noreferrer">
          <MainButton
            title="Book a demo"
            buttonTheme={ButtonTheme.MONOCHROME_REVERSED}
            style={{ display: "inline-block", width: 140 }}
          />
        </a>
      </div>
    </div>
  )
}

function SquareImage({ src, alt = "" }) {
  return (
    <div style={{ aspectRatio: "1/1", overflow: "hidden" }}>
      <img
        alt={alt}
        src={src}
        style={{ width: "100%", height: "100%", objectFit: "cover" }}
      />
    </div>
  )
}

function SquareTitleBody({ title, body }) {
  const { width } = useWindowSize()
  const isMobile = width < 750

  return (
    <div
      style={{
        aspectRatio: "1/1",
        overflow: "hidden",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        padding: 32,
      }}
    >
      <div style={{ maxWidth: 400 }}>
        <h2
          style={{
            fontFamily: "Rubik, Roboto, sans-serif",
            fontWeight: 700,
            fontSize: isMobile ? "2em" : "3em",
            margin: "auto",
            color: Colors.BLACK,
          }}
        >
          {title}
        </h2>
        <Spacer y={4} />
        <p
          style={{
            fontFamily: "Roboto, sans-serif",
            fontSize: isMobile ? "1.1em" : "1.25em",
            margin: "auto",
            color: Colors.GRAY_LIGHT,
          }}
        >
          {body}
        </p>
      </div>
    </div>
  )
}
