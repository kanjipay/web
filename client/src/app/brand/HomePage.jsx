import { useEffect, useState } from "react"
import { Helmet } from "react-helmet-async"
import { Colors } from "../../enums/Colors"
import Spacer from "../../components/Spacer"
import useWindowSize from "../../utils/helpers/useWindowSize"
import MainButton from "../../components/MainButton"
import Collection from "../../enums/Collection"
import { limit, orderBy, where } from "firebase/firestore"
import EventListing from "../customer/events/event/EventListing"
import { AnalyticsManager } from "../../utils/AnalyticsManager"
import Testimonial from "./Testimonial"
import { isMobile } from "react-device-detect"
import { ShimmerThumbnail } from "react-shimmer-effects"
import { Container } from "./FAQsPage"
import Content from "../../components/layout/Content"
import ContactForm from "./ContactForm"
import { ButtonTheme } from "../../components/ButtonTheme"
import { useNavigate } from "react-router-dom"
import { Flex } from "../../components/Listing"
import Carat from "../../assets/icons/Carat"
import Discover from "../../assets/icons/Discover"
import Analytics from "../../assets/icons/Analytics"
import Tick from "../../assets/icons/Tick"
import { PriceComparer } from "./PricingPage"
import Clock from "../../assets/icons/Clock"
import Settings from "../../assets/icons/Settings"
import User from "../../assets/icons/User"

const subtitleStyle = {
  fontFamily: "Rubik, Roboto, sans-serif",
  fontWeight: 800,
  fontSize: isMobile ? "1.5em" : "2em",
  margin: "auto",
  textAlign: "center",
  color: Colors.BLACK,
}

export default function HomePage() {
  const [events, setEvents] = useState(null)
  const navigate = useNavigate()

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

  const sectionSpacing = isMobile ? 6 : 12

  return <div>
    <Helmet>
      <title>Mercado - Putting event runners first</title>
      <meta property="og:title" content="Mercado - putting event runners first" />
      <meta name="description" content="Mercado helps artists and organisers get paid fairly for their work. We're the only ticketing platform that gives most of our booking fee back to the event organiser." />
      <meta property="og:description" content="Mercado helps artists and organisers get paid fairly for their work. We're the only ticketing platform that gives most of our booking fee back to the event organiser." />
      <meta property="og:type" content="website" />
    </Helmet>

    <div style={{ position: "relative", height: "100vh", backgroundColor: Colors.BLACK }}>
      <img 
        src="/img/gig_stage_desktop.jpg"
        alt="Monochrome gig stage" 
        style={{ width: "100%", height: "100%", position: "absolute", objectFit: "cover", transform: `translate(0, ${isMobile ? -20 : -15}%)` }}
      />

      <div style={{ width: "100%", height: "100%", position: "absolute", backgroundColor: Colors.BLACK + "66" }}></div>
      
      <div style={{ width: "100%", padding: `0 ${isMobile ? 8 : 32}px`, boxSizing: "border-box", position: "absolute", left: "50%", transform: "translate(-50%, 0)", top: "40%" }}>
        <h1
          style={{
            color: Colors.WHITE,
            fontFamily: "Rubik, Roboto, sans-serif",
            fontWeight: 800,
            maxWidth: 800,
            fontSize: isMobile ? "2em" : "4em",
            margin: "auto",
            textAlign: "center",
            width: "100%",
          }}
        >
          LET'S PUT EVENT RUNNERS FIRST
        </h1>
        <Spacer y={isMobile ? 3 : 4} />
        <div style={{
          maxWidth: 600,
          color: Colors.WHITE,
          textAlign: "center",
          fontSize: isMobile ? "1em" : "1.25em",
          margin: "auto"
        }}>
          Mercado's the only ticketing platform that gives most of our booking fee back to the event organiser.
        </div>
        <Spacer y={isMobile ? 3 : 4} />
        <MainButton
          title="Create an event"
          buttonTheme={ButtonTheme.MONOCHROME_REVERSED}
          onClick={() => navigate("/dashboard")}
          style={{ width: 200, margin: "auto" }}
        />
      </div>
    </div>

    <Spacer y={sectionSpacing} />

    <Container maxWidth={1200}>
      <Content paddingTop={0}>
        <h2 style={subtitleStyle}>Upcoming events</h2>
        <Spacer y={isMobile ? 3 : 5} />
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

        <Proposition 
          title="Sell more tickets"
          body="Our seamless checkout and automated marketing tools combine to boost sales without increasing your spend."
          features={[
            {
              icon: <Tick length={32} />,
              title: "Get more sales from each click",
              body: "Event goers can buy tickets in 4 clicks - the lowest of any ticketing provider. Our seamless checkout experience means you'll sell more by sending event goers to us.",
            },
            {
              icon: <Analytics length={32} />,
              title: "Grow your audience",
              body: "Marketing to your existing customers gives you the highest bang for your buck. We'll notify past event goers when you've got a new event on, nudge them to complete checkout, and give you the tools to do the same on social media.",
            },
            {
              icon: <Discover length={32} />,
              title: "Know your audience",
              body: "Our dashboard gives you insights into who's buying your tickets and where they're coming from, so you can make better marketing decisions.",
            },
          ]}
          image="/img/festival_crowd.jpg"
          id="learn-more-content"
        />

        <Spacer y={sectionSpacing} />

        <div style={{ maxWidth: 600, margin: "auto" }}>
          <h2 style={subtitleStyle}>Save on fees</h2>
          <Spacer y={3} />
          <p style={{
            color: Colors.GRAY_LIGHT,
            textAlign: "center",
            fontSize: isMobile ? "1.1em" : "1.25em",
          }}>We have the lowest fees of any major ticketing provider. See how much you can save below.</p>
        </div>
        <Spacer y={isMobile ? 3 : 6} />
        <PriceComparer />

        <Spacer y={sectionSpacing} />

        <Proposition
          title="Create events with ease"
          body="Create an event in 2 minutes and handle on the door entry all from your smartphone or computer."
          features={[
            {
              icon: <Clock length={32} />,
              title: "Cut down on admin",
              body: "Our easy to use dashboard lets you start selling tickets in two minutes, allowing you to spend less time on admin and more time making your event great.",
            },
            {
              icon: <Settings length={32} />,
              title: "Deep customisation",
              body: "Manage multiple ticket releases, with different prices, admission times and confirmation messages, or keep it simple with just one ticket type. The choice is up to you!",
            },
            {
              icon: <User length={32} />,
              title: "We sweat the small things",
              body: "Need to change the date, time or address of your event? When you do it in our dashboard, we automatically notify all your event goers. Hosting a weekly event? Create it once and we'll do the rest. We've built the little things that make your life easier into our platform.",
            },
          ]}
          image="/img/festival_woman.jpg"
        />

        <Spacer y={sectionSpacing} />

        <h2 style={subtitleStyle}>What people are saying</h2>
        <Spacer y={isMobile ? 3 : 5} />
        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr 1fr", columnGap: 32, rowGap: 16 }}>
          <Testimonial
            name="Neo - House of Hibernia"
            image="/img/hibernia.jpeg"
            body="Between being open to feedback, constantly providing solutions and always working around us, Mercado is by far the most considerate ticketing platform we've worked with to date."
          />
          <Testimonial
            name="Joe - Scustin"
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

        <ContactForm />
      </Content>
    </Container>
  </div>
}

function Proposition({ title, body, image, features = [], isImageOnLeft = true, style, ...props }) {
  function Features({ features }) {
    return <div style={{ display: isMobile ? "block" : "grid", gridTemplateRows: "1fr 1fr 1fr" }}>
      {
        features.map(({ icon, title, body }) => <div style={{ display: "flex", alignItems: "center", marginBottom: isMobile ? 24 : 0 }}>
          <div>
            <Flex columnGap={16}>
              {icon}
              <h4 style={{ fontFamily: "Rubik, sans-serif", fontWeight: 800, fontSize: isMobile ? "1.1em" : "1.25em" }}>{title}</h4>
            </Flex>
            <Spacer y={2} />
            <p style={{ color: Colors.GRAY_LIGHT, fontSize: isMobile ? "1em" : "1.1em" }}>{body}</p>
          </div>
        </div>)
      }
    </div>
  }

  function Image({ image }) {
    return <div>
      <img alt="" src={image} style={{ aspectRatio: "1/1", objectFit: "cover", width: "100%", borderRadius: 8 }} />
    </div>
  }

  return <div style={style} {...props}>
    <div style={{ maxWidth: 600, margin: "auto" }}>
      <h2 style={subtitleStyle}>{title}</h2>
      <Spacer y={isMobile ? 2 : 3} />
      <p style={{
        color: Colors.GRAY_LIGHT,
        textAlign: "center",
        fontSize: isMobile ? "1.1em" : "1.25em",
      }}>{body}</p>
    </div>

    <Spacer y={isMobile ? 3 : 6} />

    <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", columnGap: 64, rowGap: 24 }}>
      { isImageOnLeft ? <Image image={image} /> : <Features features={features} />}
      { isImageOnLeft ? <Features features={features} /> : <Image image={image} />}
    </div>
  </div>
}

