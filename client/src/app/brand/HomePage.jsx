import { useEffect, useState } from "react"
import { Helmet } from "react-helmet-async"
import { Colors } from "../../enums/Colors"
import Spacer from "../../components/Spacer"
import useWindowSize from "../../utils/helpers/useWindowSize"
import MainButton from "../../components/MainButton"
import { ButtonTheme } from "../../components/ButtonTheme"
import Collection from "../../enums/Collection"
import { limit, orderBy, where } from "firebase/firestore"
import EventListing from "../customer/events/event/EventListing"
import { AnalyticsManager } from "../../utils/AnalyticsManager"
import Testimonial from "./Testimonial"
import { isMobile } from "react-device-detect"
import { ShimmerThumbnail } from "react-shimmer-effects"
import { Link } from "react-router-dom"
import { Container } from "./FAQsPage"
import Content from "../../components/layout/Content"

export default function HomePage() {
  const [events, setEvents] = useState(null)

  useEffect(() => AnalyticsManager.main.viewPage("Home"), [])

  const { width } = useWindowSize()
  const contentWidth = Math.min(width, 1200) - 32

  useEffect(() => {
    return Collection.EVENT.queryOnChange(
      setEvents,
      where("isPublished", "==", true),
      where("startsAt", ">", new Date()),
      orderBy("startsAt", "asc"),
      limit(5)
    )
  }, [])

  const secondSectionImage = (
    <SquareImage src={`/img/festival_woman.jpg`} />
  )

  const secondSectionCopy = (
    <SquareTitleBody
      title="Simple, fair pricing"
      body="Our industry-leading low fee means you can spend more of your budget on making your event great. And unlike other platforms, you'll get revenue from ticket sales upfront."
      button={<Link to="/pricing">
        <MainButton title="Learn more" />
      </Link>}
    />
  )

  const sectionSpacing = isMobile ? 6 : 12

  const calendlyLink = "https://calendly.com/matt-at-mercado/demo"

  return (
    <Container maxWidth={1200}>
      <Helmet>
        <title>Mercado - Putting event runners first</title>
        <meta property="og:title" content="Mercado - putting event runners first" />
        <meta name="description" content="Mercado helps artists and organisers get paid fairly for their work. We're the only ticketing platform that gives most of our booking fee back to the event organiser." />
        <meta property="og:description" content="Mercado helps artists and organisers get paid fairly for their work. We're the only ticketing platform that gives most of our booking fee back to the event organiser." />
        <meta property="og:type" content="website" />
      </Helmet>

      <Content>
        <Spacer y={isMobile ? 16 : 20} />

        <h1
          style={{
            color: Colors.BLACK,
            fontFamily: "Rubik, Roboto, sans-serif",
            fontWeight: 800,
            maxWidth: 800,
            fontSize: isMobile ? "2.5em" : "4em",
            margin: "auto",
            textAlign: "center",
            width: "100%",
          }}
        >
          IT'S TIME TO PUT EVENT RUNNERS FIRST
        </h1>
        <Spacer y={4} />
        <div style={{
          maxWidth: 600,
          color: Colors.GRAY_LIGHT,
          textAlign: "center",
          fontSize: isMobile ? "1.1em" : "1.25em",
          margin: "auto"
        }}>
          Mercado helps artists and organisers get paid fairly for their work.
          <Spacer y={2} />
          We're the only ticketing platform that gives most of our booking fee back to the event organiser.
        </div>
        <Spacer y={4} />
        <a href={calendlyLink} target="_blank" rel="noreferrer">
          <MainButton
            title="Learn more"
            style={{ width: 200, margin: "auto" }}
          />
        </a>

        <Spacer y={sectionSpacing} />

        <h2
          style={{
            fontFamily: "Rubik, Roboto, sans-serif",
            fontWeight: 700,
            fontSize: isMobile ? "1.5em" : "2em",
            margin: "auto",
            color: Colors.BLACK,
          }}
        >
          Upcoming events
        </h2>
        <Spacer y={3} />
        <div style={{ display: isMobile ? "block" : "flex", columnGap: 24 }}>
          {
            events ?
              events.filter(e => e.isDiscoverable !== false).slice(0, 3).map((event) => {
                const listing = (
                  <EventListing
                    key={event.id}
                    event={event}
                    style={{ width: isMobile ? "auto" : "calc(33% - 16px)", borderRadius: 8, overflow: "hidden" }}
                    linkPath={`/events/${event.merchantId}/${event.id}`}
                  />
                )

                if (isMobile) {
                  return (
                    <div>
                      <div style={{ borderRadius: 8, overflow: "hidden" }}>
                        {listing}
                      </div>
                      <Spacer y={3} />
                    </div>
                  )
                } else {
                  return listing
                }
              }) :
              [1, 2, 3].map(() => {
                const height = isMobile ? contentWidth : (contentWidth - 24 * 2) / 3
                if (isMobile) {
                  return <div>
                    <ShimmerThumbnail height={height} width="auto" rounded />
                    <Spacer y={3} />
                  </div>
                } else {
                  return <div style={{ flexGrow: 100 }}>
                    <ShimmerThumbnail height={height} rounded />
                  </div>
                }

              })
          }
        </div>

        <Spacer y={sectionSpacing} />

        <div style={{
          margin: "auto",
          width: "100%",
          maxWidth: 1200,
        }}>
          <img
            alt=""
            src={`/img/festival_crowd.jpg`}
            style={{
              objectFit: "cover",
              borderRadius: 8,
              width: "100%"
            }}
          />
        </div>

        {/* <div style={{
        position: "relative",
        paddingBottom: "62.5%",
        height: 0,
      }}>
        <iframe 
          title="loom demo"
          src="https://www.loom.com/embed/949a76f6fb8a47078159f8f9763a7c4f" 
          frameborder="0" 
          webkitallowfullscreen 
          mozallowfullscreen 
          allowfullscreen 
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            borderRadius: 8
          }}>
        </iframe>
      </div> */}

        <Spacer y={sectionSpacing} />

        <h2
          style={{
            fontFamily: "Rubik, Roboto, sans-serif",
            fontWeight: 700,
            fontSize: isMobile ? "1.5em" : "2em",
            margin: "auto",
            color: Colors.BLACK,
          }}
        >
          What people are saying
        </h2>
        <Spacer y={3} />
        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr 1fr", columnGap: 32, rowGap: 16 }}>
          <Testimonial
            name="House of Hibernia"
            image="/img/hibernia.jpeg"
            body="Between being open to feedback, constantly providing solutions and always working around us, Mercado is by far the most considerate ticketing platform we've worked with to date."
          />
          <Testimonial
            name="Scustin"
            image="/img/scustin.jpeg"
            body="Mercado were an absolute joy to work with. The website is easy to use, the analytics provide unique insights and the customer service is impeccable. We'll definitely be using them again!"
          />
          <Testimonial
            name="DJ Mona Lxsa"
            image="/img/monalxsa.jpeg"
            body="Shout out @mercado.tickets for making every promoters life easy and reliable! They are always on job! 💫🔥"
          />
        </div>

        <Spacer y={sectionSpacing} />

        <div
          style={{
            display: "grid",
            gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
            columnGap: 32,
            rowGap: isMobile ? 16 : 32,
          }}
        >
          <div
            style={{
              aspectRatio: isMobile ? "auto" : "1/1",
              borderRadius: 8,
              overflow: "hidden",
              backgroundColor: Colors.BLACK,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: 32,
            }}
          >
            <img
              src={`/img/festival_event_mockup.png`}
              alt=""
              style={{ width: isMobile ? "100%" : "70%" }}
            />
          </div>
          <SquareTitleBody
            title="Create. Sell. Manage."
            body="An easy, customisable events platform, fully integrated with social media. Create events, share the link with customers, accept payments, and manage QR code tickets, all from your dashboard."
          />

          {isMobile ? secondSectionImage : secondSectionCopy}

          {isMobile ? secondSectionCopy : secondSectionImage}

          <SquareImage src={`/img/dj_deck.jpg`} />
          <SquareTitleBody
            title="Advanced marketing analytics"
            body="View your ticket sales by event, promoter, ticket type, social media post and more. Drive sales with email and social media retargeting."
          />
        </div>

        <Spacer y={sectionSpacing} />

        <div
          style={{
            textAlign: "center",
            backgroundColor: Colors.OFF_BLACK,
            padding: "128px 16px",
            borderRadius: 8
          }}
        >
          <h2
            style={{
              width: isMobile ? "auto" : "60%",
              color: Colors.WHITE,
              fontFamily: "Rubik, Roboto, sans-serif",
              fontWeight: 700,
              fontSize: isMobile ? "2em" : "3em",
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

        <Spacer y={sectionSpacing} />
      </Content>
    </Container>
  )
}

function SquareImage({ src, alt = "" }) {
  return (
    <div style={{ aspectRatio: "1/1", overflow: "hidden", borderRadius: 8 }}>
      <img
        alt={alt}
        src={src}
        style={{ width: "100%", height: "100%", objectFit: "cover" }}
      />
    </div>
  )
}

function SquareTitleBody({ title, body, button }) {
  const { width } = useWindowSize()
  const isMobile = width < 750

  return (
    <div
      style={{
        overflow: "hidden",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        borderRadius: 8,
        backgroundColor: Colors.OFF_WHITE_LIGHT,
        padding: 32,
      }}
    >
      <div style={{ maxWidth: 400 }}>
        <h2
          style={{
            fontFamily: "Rubik, Roboto, sans-serif",
            fontWeight: 700,
            fontSize: isMobile ? "1.5em" : "2em",
            margin: "auto",
            color: Colors.BLACK,
          }}
        >
          {title}
        </h2>
        <Spacer y={3} />
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
        {
          button && <div style={{ textAlign: "center" }}>
            <Spacer y={3} />
            {button}
          </div>
        }
      </div>
    </div>
  )
}
