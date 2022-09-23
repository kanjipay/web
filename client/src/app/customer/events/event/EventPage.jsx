import AsyncImage from "../../../../components/AsyncImage"
import Spacer from "../../../../components/Spacer"
import { getEventStorageRef } from "../../../../utils/helpers/storage"
import { useNavigate, useParams } from "react-router-dom"
import ProductListing from "../product/ProductListing"
import EventsAppNavBar from "../secure/EventsAppNavBar"
import { Colors } from "../../../../enums/Colors"
import ShowMoreText from "react-show-more-text"
import { dateFromTimestamp } from "../../../../utils/helpers/time"
import { useEffect } from "react"
import { AnalyticsManager } from "../../../../utils/AnalyticsManager"
import { addMinutes, format } from "date-fns"
import { Helmet } from "react-helmet-async"
import useWindowSize from "../../../../utils/helpers/useWindowSize"
import MainButton from "../../../../components/MainButton"
import { useState } from "react"
import { formatCurrency } from "../../../../utils/helpers/money"
import Spotify from "react-spotify-embed"
import Carat from "../../../../assets/icons/Carat"
import Spinner from "../../../../assets/Spinner"
import { ShimmerThumbnail, ShimmerTitle, ShimmerText, ShimmerButton } from "react-shimmer-effects";
import { EventDetails } from "./EventDetails"
import { Container } from "../../../brand/FAQsPage"
import Content from "../../../../components/layout/Content"
import { Flex } from "../../../../components/Listing"
import { Body } from "../../../auth/AuthPage"

export default function EventPage({ merchant, event, products, artists }) {
  const { eventId, merchantId } = useParams()
  const navigate = useNavigate()
  const { width } = useWindowSize()
  const contentWidth = Math.min(width, 500)
  const headerImageHeight = contentWidth
  const hasAlreadyHappened = event ?
    new Date() >= addMinutes(dateFromTimestamp(event?.endsAt), -30) :
    false

  const processingFee = merchant?.customerFee ?? 0.1

  const [isTicketsButtonVisible, setIsTicketsButtonVisible] = useState(!hasAlreadyHappened)

  useEffect(() => {
    if (hasAlreadyHappened || !event?.isPublished) { return }

    try {
      const target = document.querySelector('#get-tickets')

      const observer = new IntersectionObserver(entries => {
        const shouldTicketsButtonBeVisible = !entries[0].isIntersecting && !hasAlreadyHappened

        if (shouldTicketsButtonBeVisible !== isTicketsButtonVisible) {
          setIsTicketsButtonVisible(shouldTicketsButtonBeVisible)
        }
      })

      observer.observe(target)
    } catch (err) {
      
    }
  })

  useEffect(() => AnalyticsManager.main.viewPage("Event", { merchantId, eventId }), [eventId, merchantId])

  const eligibleProducts = products?.filter(product => !product.isPrivate)

  const handleGetTickets = () => {
    if (eligibleProducts.length === 1) {
      navigate(eligibleProducts[0].id)
    } else {
      const element = document.getElementById("get-tickets");
      element.scrollIntoView({ behavior: "smooth" })
    }
  }

  return (
    <Container>
      <EventsAppNavBar
        title={event?.title ?? <Spinner length={20} />}
        transparentDepth={headerImageHeight - 96}
        opaqueDepth={headerImageHeight - 48}
        back="../.."
      />

      <Helmet>
        <title>
          {`${event?.title ?? ""} | ${merchant?.displayName ?? ""} | Mercado`}
        </title>
      </Helmet>

      {
        event ?
          <AsyncImage
            imageRef={getEventStorageRef(event, event.photo)}
            style={{ width: "100%", aspectRatio: "1/1" }}
            alt={event.title}
          /> :
          <ShimmerThumbnail height={headerImageHeight} />
      }

      {
        isTicketsButtonVisible && !hasAlreadyHappened && event && products && merchant && <div className="anchored-bottom">
          <MainButton 
            title="Get tickets" 
            onClick={handleGetTickets}
            icon={eligibleProducts.length > 1 && <Carat length={20} color={Colors.WHITE} />}
            sideMessage={
              eligibleProducts.length === 1 ? 
                formatCurrency(eligibleProducts[0].price, merchant.currency) : 
                null
            }
            style={{ borderRadius: 0 }}
          />
        </div>
      }

      <Content paddingTop={24}>
        {
          event && merchant ?
            <div>
              <h1 className="header-l">{event.title}</h1>
              {event.tags && event.tags.length > 0 && (
                <div>
                  <Spacer y={2} />
                  <Flex columnGap={4}>
                    {event.tags.map((tag) => {
                      return (
                        <p
                          key={tag}
                          className="text-body"
                          style={{
                            padding: "4px 8px",
                            backgroundColor: Colors.OFF_WHITE_LIGHT,
                          }}
                        >
                          {tag}
                        </p>
                      )
                    })}
                  </Flex>
                </div>
              )}
            </div> :
            <div>
              <ShimmerTitle />
              <Flex columnGap={8}>
                <ShimmerButton size="sm" />
                <ShimmerButton size="sm" />
                <ShimmerButton size="sm" />
              </Flex>
            </div>
        }

        <Spacer y={2} />

        <EventDetails event={event} merchant={merchant} artists={artists} />

        {
          event ? 
            event.description?.length > 0 && <div>
              <Spacer y={4} />
              <ShowMoreText lines={5} keepNewLines={true} className="text-body-faded">
                {event.description}
              </ShowMoreText>
            </div> :
            <div>
              <Spacer y={4} />
              <ShimmerText />
            </div>
        }

        {
          merchant ?
            !!merchant?.spotify?.showsOnEvents && <div>
              <Spacer y={4} />
              <Spotify wide link={merchant.spotify.link} style={{ borderRadius: 2 }} />
            </div> : <div>
              <Spacer y={4} />
              <ShimmerThumbnail height={90} />
            </div>
        }

        <Spacer y={4} />

        {hasAlreadyHappened && <Body>
          This event ended on{" "}
          {format(dateFromTimestamp(event.endsAt), "do MMM")} at{" "}
          {format(dateFromTimestamp(event.endsAt), "H:mm")}.
        </Body>}

        {!hasAlreadyHappened && !event?.isPublished && <Body>This event isn't published yet.</Body>}

        {
          !hasAlreadyHappened && event?.isPublished && <div>
            <h2 className="header-m" id="get-tickets">Get tickets</h2>
            <Spacer y={2} />
            {
              products && event ?
                <div>
                  {!event.isPublished && (
                    <div>
                      <p>
                        {event.publishScheduledAt
                          ? `Tickets to this event will become available on ${format(
                            dateFromTimestamp(event.endsAt),
                            "do MMM"
                          )} at ${format(dateFromTimestamp(event.endsAt), "H:mm")}.`
                          : "The event organiser hasn't made tickets available yet."}
                      </p>
                      <Spacer y={2} />
                    </div>
                  )}
                  {products
                    .filter(product => !product.isPrivate)
                    .map((product) => {
                      return (
                        <div key={product.id}>
                          <ProductListing
                            product={product}
                            currency={merchant.currency}
                            processingFee={processingFee}
                            isPublished={event.isPublished}
                          />
                          <Spacer y={1} />
                        </div>
                      )
                    })
                  }
                </div> :
                <div>
                  <ShimmerThumbnail height={60} rounded={true} />
                  <ShimmerThumbnail height={60} rounded={true} />
                  <ShimmerThumbnail height={60} rounded={true} />
                </div>
            }
          </div>
        }
        <Spacer y={8} />
      </Content>
    </Container>
  )
}
