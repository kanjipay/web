import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link, useParams } from "react-router-dom";
import { Colors } from "../../components/CircleButton"
import Spacer from "../../components/Spacer"
import useWindowSize from "../../utils/helpers/useWindowSize";
import NotFound from "../shared/NotFoundPage";
import BlockButton from "./BlockButton";
import * as pluralize from "pluralize"

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
  const { width } = useWindowSize();
  const isMobile = width < 750

  const { customerSegmentId } = useParams()

  const [customerSegment, setCustomerSegment] = useState(CustomerSegment.GENERAL)

  useEffect(() => {
    if (customerSegmentId) {
      const segment = CustomerSegment.all().find(s => s.id === customerSegmentId)
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

  const secondSectionImage = <SquareImage src={`/img/${customerSegment.photo1}`} />

  const secondSectionCopy = <SquareTitleBody
    title="Flat 2% processing fee"
    body="Our industry-leading low fee means you can spend more of your budget on making your event great. And unlike other platforms, you'll get revenue from ticket sales upfront."
  />

  return <div>
    <Helmet>
      <title>The smart events management platform | Mercado</title>
    </Helmet>
    <div style={{
      width: "100vw",
      height: "100vh",
      position: "relative",
    }}>
      <img alt="" src={`/img/${customerSegment.headerPhoto}`} style={{ backgroundColor: Colors.BLACK, width: "100%", height: "100%", position: "absolute", objectFit: "cover" }} />
      <div style={{
        position: "absolute",
        backgroundColor: "#00000080",
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "0px 32px",
        boxSizing: "border-box"
      }}>
        <h1 style={{
          color: Colors.WHITE,
          fontFamily: "Rubik, Roboto, sans-serif",
          fontWeight: 700,
          maxWidth: 800,
          fontSize: isMobile ? "3em" : "4em",
          textAlign: "center",
          width: "100%",

        }}>{headline}</h1>
      </div>

    </div>
    <div style={{
      display: "grid",
      gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
    }}>
      <div style={{
        aspectRatio: isMobile ? "auto" : "1/1",
        overflow: "hidden",
        backgroundColor: Colors.BLACK,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 32
      }}>
        <img src={`/img/${customerSegment.screenshotPhoto}`} alt="" style={{ width: isMobile ? "100%" : "50%" }} />
      </div>
      <SquareTitleBody
        title="Create. Sell. Manage."
        body="An easy, customisable events platform, fully integrated with social media. Create events, share the link with customers, accept payments, and manage QR code tickets, all from your dashboard."
      />

      {
        isMobile ? secondSectionImage : secondSectionCopy
      }

      {
        isMobile ? secondSectionCopy : secondSectionImage
      }

      <SquareImage src={`/img/${customerSegment.photo2}`} />
      <SquareTitleBody
        title="Advanced marketing analytics"
        body="View your ticket sales by event, promoter, ticket type, social media post and more. Pinpoint and expand your customer base with our AI marketing tool."
      />
    </div>

    <div style={{
      textAlign: "center",
      backgroundColor: Colors.OFF_BLACK,
      padding: "128px 0px"
    }}>
      <h2 style={{
        width: isMobile ? "auto" : "60%",
        color: Colors.WHITE,
        fontFamily: "Rubik, Roboto, sans-serif",
        fontWeight: 700,
        fontSize: isMobile ? "3em" : "4em",
        margin: "auto"
      }}>
        Learn more about our product
      </h2>
      <Spacer y={4} />
      <Link to="/book-demo">
        <BlockButton title="Book a demo" style={{ display: "inline-block", width: 140 }} />
      </Link>

    </div>
  </div>
}

function SquareImage({ src, alt = "" }) {
  return <div style={{ aspectRatio: "1/1", overflow: "hidden" }}>
    <img alt={alt} src={src} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
  </div>
}

function SquareTitleBody({ title, body }) {
  const { width } = useWindowSize();
  const isMobile = width < 750

  return <div style={{ 
    aspectRatio: "1/1", 
    overflow: "hidden", 
    display: "flex", 
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center",
    padding: 32
  }}>
    <div style={{ maxWidth: 400, }}>
      <h2 style={{
        fontFamily: "Rubik, Roboto, sans-serif",
        fontWeight: 700,
        fontSize: isMobile ? "2em" : "3em",
        margin: "auto",
        color: Colors.BLACK
      }}>{title}</h2>
      <Spacer y={4} />
      <p style={{
        fontFamily: "Roboto, sans-serif",
        fontSize: isMobile ? "1.1em" : "1.25em",
        margin: "auto",
        color: Colors.GRAY_LIGHT
      }}>{body}</p>
    </div>
  </div>
}