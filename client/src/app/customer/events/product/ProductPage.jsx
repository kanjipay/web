import { useEffect, useState } from "react"
import { Colors } from "../../../../enums/Colors"
import { ButtonTheme } from "../../../../components/ButtonTheme"
import MainButton from "../../../../components/MainButton"
import Spacer from "../../../../components/Spacer"
import { formatCurrency } from "../../../../utils/helpers/money"
import LoadingPage from "../../../../components/LoadingPage"
import { useOpenAuthPage } from "../../../auth/useOpenAuthPage"
import { useLocation, useNavigate, useParams } from "react-router-dom"
import SmallButton from "../../../../components/SmallButton"
import EventsAppNavBar from "../secure/EventsAppNavBar"
import {
  MarketingConsent,
  setMarketingConsent,
} from "../../../../utils/services/UsersService"
import CheckBox from "../../../../components/CheckBox"
import Stepper from "../../../../components/Stepper"
import { validateEmail } from "../../../../utils/helpers/validation"
import { format } from "date-fns"
import { dateFromTimestamp } from "../../../../utils/helpers/time"
import { OrderSummary } from "../../../../components/OrderSummary"
import { AnalyticsManager } from "../../../../utils/AnalyticsManager"
import { Helmet } from "react-helmet-async"
import { getDoc } from "firebase/firestore"
import { logMetaPixelEvent } from "../../../../utils/MetaPixelLogger"
import Collection from "../../../../enums/Collection"
import ShowMoreText from "react-show-more-text"
import Spinner from "../../../../assets/Spinner"
import { ShimmerThumbnail, ShimmerTitle, ShimmerText, ShimmerTable } from "react-shimmer-effects";
import { IdentityManager } from "../../../../utils/IdentityManager"
import { NetworkManager } from "../../../../utils/NetworkManager"
import { getLatestItem } from "../../../shared/attribution/AttributionReducer"
import { v4 as uuid } from "uuid"
import { useOpenErrorPage } from "../../../../utils/useOpenErrorPage"
import Cross from "../../../../assets/icons/Cross"
import IconActionPage from "../../../../components/IconActionPage"
import { Container } from "../../../brand/FAQsPage"
import Content from "../../../../components/layout/Content"
import { Body, Caption } from "../../../auth/AuthPage"
import { Flex } from "../../../../components/Listing"
import FlexSpacer from "../../../../components/layout/FlexSpacer"

function combineIntoUniqueArray(...arrays) {
  if (arrays.length === 0) {
    return []
  } else if (arrays.length === 1) {
    return [...new Set(arrays[0])]
  }

  return [...new Set(arrays[0].concat(...arrays.slice(1)))]
}

function getAttestations(merchant, event, product) {
  const merchantAttestations = merchant.attestations ?? []
  const eventAttestations = event.attestations ?? []
  const productAttestations = product.attestations ?? []

  return combineIntoUniqueArray(
    merchantAttestations,
    eventAttestations,
    productAttestations
  )
}

export default function ProductPage({ merchant, event, product, user }) {
  const [quantity, setQuantity] = useState(1)
  const { productId, eventId, merchantId } = useParams()
  const openAuthPage = useOpenAuthPage()
  const openErrorPage = useOpenErrorPage()
  const navigate = useNavigate()
  const { pathname, state } = useLocation()
  const [isMarketingConsentApproved, setIsMarketingConsentApproved] =
    useState(true)
  const [attestationData, setAttestationData] = useState({})
  const customerFee = merchant?.customerFee ?? 0.1
  const [isLoading, setIsLoading] = useState(false)

  const isPublished = event?.isPublished ?? true
  const isAuthenticated = !!user?.email

  const submitOrder = (checkoutUrlType) => {
    const deviceId = IdentityManager.main.getDeviceId()
    const attributionItem = getLatestItem({ eventId })
    const orderId = uuid()

    let redirectPath

    switch (checkoutUrlType) {
      case "FREE":
        redirectPath = `/events/s/orders/${orderId}/confirmation`
        setIsLoading(true)
        break;
      case "CARD":
        redirectPath = `/checkout/o/${orderId}/payment-stripe`
        break;
      case "OPEN_BANKING":
        redirectPath = `/checkout/o/${orderId}/choose-bank`
        break;
      default:
        redirectPath = `/checkout/o/${orderId}/payment-stripe`
    }

    NetworkManager.post("/orders/tickets", {
      orderId,
      productId,
      quantity,
      deviceId,
      attributionData: attributionItem?.attributionData,
    }).then(() => {
      NetworkManager.put(`/orders/o/${orderId}/enrich`, { locale: navigator.language }).then(() => { })
      navigate(redirectPath)
      setIsLoading(false)
    })
      .catch((error) => {
        openErrorPage({
          title: "The order failed",
          description: error?.response?.data?.message,
        })
      })

    if (checkoutUrlType !== "FREE") {
      navigate(redirectPath, {
        state: {
          shouldEmphasiseOpenBanking: merchant?.openBankingSettings ? merchant.openBankingSettings === "ON" : true
        }
      })
    }
  }

  useEffect(() => {
    AnalyticsManager.main.viewPage("Product", {
      productId,
      eventId,
      merchantId,
      isAuthenticated,
    })
  }, [productId, eventId, merchantId, isAuthenticated])

  useEffect(() => {
    if (!merchantId || !productId || !user) {
      return
    }
    // I think Meta does deduplication but might be cleaner to get this to run once per order
    getDoc(Collection.MERCHANT.docRef(merchantId)).then((merchantDoc) => {
      const { metaPixelId } = merchantDoc.data()
      logMetaPixelEvent(metaPixelId, user, "ViewContent", {}) // todo add data with productId
    })
  }, [merchantId, productId, user])

  useEffect(() => {
    if (merchant && event && product) {
      const attestations = getAttestations(merchant, event, product)

      const attestationData = attestations.reduce(
        (attestationData, attestation) => {
          attestationData[attestation] = false
          return attestationData
        },
        {}
      )

      setAttestationData(attestationData)
    }
  }, [merchant, event, product])

  const maxQuantity = event?.maxTicketsPerPerson ?? 10
  const minQuantity = 1

  const handleCheckout = () => {
    let checkoutUrlType

    if (product.price === 0) {
      checkoutUrlType = "FREE"
    } else if (
      merchant.crezco?.userId &&
      merchant.currency === "GBP" &&
      merchant.openBankingSettings !== "OFF"
    ) {
      checkoutUrlType = "OPEN_BANKING"
    } else {
      checkoutUrlType = "CARD"
    }

    AnalyticsManager.main.pressButton("Checkout", { eventId, productId, checkoutType: checkoutUrlType, isAuthenticated })

    if (user && user.email) {
      if (!user.marketingConsentStatus || user.marketingConsentStatus === MarketingConsent.PENDING) {
        const marketingConsentStatus = isMarketingConsentApproved
          ? MarketingConsent.APPROVED
          : MarketingConsent.DECLINED

        setMarketingConsent(marketingConsentStatus).then(() => {})
      }

      submitOrder(checkoutUrlType)
    } else {
      const marketingConsentStatus = isMarketingConsentApproved
        ? MarketingConsent.APPROVED
        : MarketingConsent.DECLINED

      const successState = {
        checkoutUrlType,
        marketingConsentStatus,
        quantity
      }
      
      openAuthPage({
        successPath: pathname + "/redirect",
        successState,
        message: `Log in to continue buying tickets to ${event.title}.`,
        showsBack: true,
        backPath: pathname,
      })
    }
  }

  const handleChangeEmail = () => {
    openAuthPage({
      successPath: pathname,
      showsBack: true,
      message: "Log in with the email you want to send tickets to.",
      backPath: pathname,
    })
  }

  function getEmailDomain() {
    return product?.emailDomain ?? event?.emailDomain ?? merchant?.emailDomain
  }

  function isValidEmail() {
    const email = user?.email ?? ""
    return validateEmail(email, getEmailDomain())
  }

  function canBuyProduct() {
    const hasAgreedToAttestations = Object.values(attestationData).every(
      (x) => x
    )
    return hasAgreedToAttestations && (!user?.email || isValidEmail()) && isPublished
  }

  const releaseDate = dateFromTimestamp(product?.releasesAt)
  const releaseEndDate = dateFromTimestamp(product?.releaseEndsAt)

  const currDate = new Date()
  const isUnreleased = !!product && !!releaseDate && releaseDate > currDate
  const isExpired = !!product && !!releaseEndDate && releaseEndDate < currDate
  const isSoldOut = !!product && product.soldCount + product.reservedCount >= product.capacity

  const isProductUnavailable = !!product && (
    !product.isAvailable ||
    isUnreleased ||
    isExpired ||
    isSoldOut
  )

  if (isProductUnavailable) {
    let message = "This ticket is unavailable"

    if (isSoldOut) {
      message = "This ticket type is sold out."
    } else if (isUnreleased) {
      message = `This ticket type releases ${format(releaseDate, "MMM do")} at ${format(
        releaseDate,
        "H:mm"
      )}.`
    } else if (isExpired) {
      message = `The release of this ticket type ended ${format(releaseEndDate, "MMM do")} at ${format(
        releaseEndDate,
        "H:mm"
      )}.`
    } else if (!product?.isAvailable) {
      message = "The event organiser set this ticket type as not available."
    }
    
    return <IconActionPage 
      Icon={Cross}
      iconBackgroundColor={Colors.RED_LIGHT}
      iconForegroundColor={Colors.RED}
      title="Ticket type unavailable"
      body={message}
      primaryAction={() => navigate("../..")}
      primaryActionTitle="Back to event"
    />
  } else {
    return <Container>
      <EventsAppNavBar
        title={product?.title ?? <Spinner length={20} />}
        back="../.."
      />

      <Helmet>
        <title>
          {`${event?.title ?? ""} | ${merchant?.displayName ?? ""} | Mercado`}
        </title>
      </Helmet>

      <Content>
        {
          product ?
            <div>
              <h1 className="header-l">{product.title}</h1>

              {
                product.description?.length > 0 && <div>
                  <Spacer y={3} />

                  <ShowMoreText lines={5} keepNewLines={true} className="text-body-faded">
                    {product.description}
                  </ShowMoreText>
                </div>
              }

              {product.earliestEntryAt && (
                <div>
                  <Spacer y={3} />
                  <div style={{ display: "flex", columnGap: 8 }}>
                    <h4 className="header-xs">Earliest entry:</h4>
                    <p>
                      {format(
                        dateFromTimestamp(product.earliestEntryAt),
                        "do MMM at HH:mm"
                      )}
                    </p>
                  </div>
                </div>
              )}
              {product.latestEntryAt && (
                <div>
                  <Spacer y={3} />
                  <div style={{ display: "flex", columnGap: 8 }}>
                    <h4 className="header-xs">Latest entry:</h4>
                    <p>
                      {format(dateFromTimestamp(product.latestEntryAt), "do MMM") +
                        " at " +
                        format(dateFromTimestamp(product.latestEntryAt), "HH:mm")}
                    </p>
                  </div>
                </div>
              )}
            </div> :
            <div>
              <ShimmerTitle />
              <ShimmerText line={3} />
            </div>
        }
        
        <Spacer y={3} />

        <h3 className="header-s">Number of tickets</h3>
        <Spacer y={2} />
        <Stepper
          value={quantity}
          onChange={(value) => setQuantity(value)}
          minValue={minQuantity}
          maxValue={maxQuantity}
        />

        <Spacer y={4} />

        {user?.email && (
          <div>
            <h3 className="header-s">Email address</h3>
            <Spacer y={2} />

            <Flex columnGap={8}>
              {getEmailDomain() &&
                !validateEmail(user.email, getEmailDomain()) ? (
                <p className="text-body-faded">
                  {"You need an email address ending in "}
                  <span className="text-body" style={{ fontWeight: 500 }}>
                    {"@" + getEmailDomain()}
                  </span>
                  {
                    " to buy tickets to this event, but you're currently logged in as "
                  }
                  <span className="text-body" style={{ fontWeight: 500 }}>
                    {user.email}
                  </span>
                  .
                </p>
              ) : (
                <p className="text-body-faded">
                  {"Your tickets will be emailed to "}
                  <span className="text-body" style={{ fontWeight: 500 }}>
                    {user.email}
                  </span>
                  .
                </p>
              )}
              <FlexSpacer />
              <SmallButton
                title="Change"
                buttonTheme={ButtonTheme.MONOCHROME_OUTLINED}
                onClick={handleChangeEmail}
              />
            </Flex>
            <Spacer y={4} />
          </div>
        )}

        <h3 className="header-s">Order Summary</h3>
        <Spacer y={2} />
        {
          product && merchant ?
            <OrderSummary
              lineItems={[{ title: product.title, quantity, price: product.price }]}
              currency={merchant.currency}
              feePercentage={customerFee}
            /> :
            <ShimmerTable row={3} col={2} />
        }
        
        <Spacer y={6} />

        {
          Object.keys(attestationData).map((attestation) => <Flex columnGap={16} style={{ marginBottom: 24 }}>
            <CheckBox
              length={20}
              color={Colors.GRAY_LIGHT}
              value={attestationData[attestation]}
              onChange={(event) =>
                setAttestationData({
                  ...attestationData,
                  [attestation]: event.target.value,
                })
              }
              test-name="product-attestation-checkbox"
            />
            <p className="text-body">{attestation}</p>
          </Flex>)
        }

        {!user?.email && getEmailDomain() && <Body style={{ marginBottom: 24 }} isFaded>
          {"You'll need an email ending in "}
          <span className="text-body" style={{ fontWeight: 500 }}>
            {"@" + getEmailDomain()}
          </span>
          {" to buy tickets to this event."}
        </Body>}

        {
          product && event && merchant ?
            <MainButton
              title={
                isPublished ?
                  "Checkout"
                  : "Not available"
              }
              sideMessage={
                isPublished
                  ? formatCurrency(
                    Math.round(product.price * quantity * (1 + customerFee)),
                    merchant.currency
                  )
                  : undefined
              }
              onClick={handleCheckout}
              disabled={!canBuyProduct()}
              isLoading={isLoading}
              style={{ boxSizing: "borderBox" }}
              test-id="product-cta-button"
            /> :
            <ShimmerThumbnail height={48} rounded />
        }
        

        {(!user || user.marketingConsentStatus === MarketingConsent.PENDING) && <Flex columnGap={8} style={{ marginTop: 16 }}>
          <CheckBox
            length={20}
            color={Colors.GRAY_LIGHT}
            value={isMarketingConsentApproved}
            onChange={(event) => setIsMarketingConsentApproved(event.target.value)}
            test-id="product-marketing-consent-status"
          />
          <Caption>Get notified when this organiser has another relevant event on
            soon (recommended).</Caption>
        </Flex>}
      </Content>
    </Container>
  }
}
