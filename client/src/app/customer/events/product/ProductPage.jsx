import { useEffect, useState } from "react";
import AsyncImage from "../../../../components/AsyncImage";
import { Colors } from "../../../../enums/Colors";
import { ButtonTheme } from "../../../../components/ButtonTheme";
import MainButton from "../../../../components/MainButton";
import Spacer from "../../../../components/Spacer";
import { formatCurrency } from "../../../../utils/helpers/money";
import { getEventStorageRef } from "../../../../utils/helpers/storage";
import LoadingPage from "../../../../components/LoadingPage"
import { useOpenAuthPage } from "../../../auth/useOpenAuthPage";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import SmallButton from "../../../../components/SmallButton";
import EventsAppNavBar from "../secure/EventsAppNavBar";
import { MarketingConsent, setMarketingConsent } from "../../../../utils/services/UsersService";
import CheckBox from "../../../../components/CheckBox";
import Stepper from "../../../../components/Stepper";
import { validateEmail } from "../../../../utils/helpers/validation";
import { format } from "date-fns";
import { dateFromTimestamp } from "../../../../utils/helpers/time";
import { OrderSummary } from "../../../../components/OrderSummary";
import { AnalyticsManager } from "../../../../utils/AnalyticsManager";

function combineIntoUniqueArray(...arrays) {
  if (arrays.length < 2) { return arrays }

  return [...new Set(arrays[0].concat(...arrays.slice(1)))]
}

function getAttestations(merchant, event, product) {
  const merchantAttestations = merchant.attestations ?? []
  const eventAttestations = event.attestations ?? []
  const productAttestations = product.attestations ?? []

  return combineIntoUniqueArray(merchantAttestations, eventAttestations, productAttestations)
}

export default function ProductPage({ merchant, event, product, user }) {
  const [quantity, setQuantity] = useState(1)
  const { productId, eventId, merchantId } = useParams()
  const openAuthPage = useOpenAuthPage()
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const isMarketingConsentShowing = user && user.marketingConsentStatus === "PENDING"
  const [isMarketingConsentApproved, setIsMarketingConsentApproved] = useState(true)
  const [attestationData, setAttestationData] = useState({})
  const [isLoading, setIsLoading] = useState(false)

  const customerFee = merchant.customerFee ?? 0.1

  useEffect(() => {
    AnalyticsManager.main.viewPage("Product", { 
      productId, 
      eventId, 
      merchantId,
      isAuthenticated: !!user?.email
    })
  })

  useEffect(() => {
    const attestations = getAttestations(merchant, event, product)

    const attestationData = attestations.reduce((attestationData, attestation) => {
      attestationData[attestation] = false
      return attestationData
    }, {})

    setAttestationData(attestationData)
  }, [merchant, event, product])

  const maxQuantity = event.maxTicketsPerPerson ?? 10
  const minQuantity = 1

  const handleCheckout = () => {
    if (user && user.email) {
      function navigateToTicketsPage() {
        const state = {
          productId,
          quantity,
          eventId,
          backPath: pathname
        }

        navigate("/events/s/orders/tickets", { state })
      }

      if (isMarketingConsentShowing) {
        setIsLoading(true)
        const marketingConsentStatus = isMarketingConsentApproved ? MarketingConsent.APPROVED : MarketingConsent.DECLINED

        setMarketingConsent(marketingConsentStatus).then(() => {
          setIsLoading(false)
          navigateToTicketsPage()
        })
      } else {
        navigateToTicketsPage()
      }
    } else {
      openAuthPage({
        successPath: pathname,
        showsBack: true,
        backPath: pathname,
        requiresPassword: false,
        requiredEmailDomain: getEmailDomain()
      })
    }
  }

  const handleChangeEmail = () => {
    openAuthPage({ 
      successPath: pathname, 
      requiresPassword: false,
      requiredEmailDomain: getEmailDomain()
    })
  }

  function getEmailDomain() {
    return product.emailDomain ?? event.emailDomain ?? merchant.emailDomain
  }

  function isValidEmail() {
    const email = user?.email ?? ""
    return validateEmail(email, getEmailDomain())
  }

  function canBuyProduct() {
    const hasAgreedToAttestations = Object.values(attestationData).every(x => x)
    return hasAgreedToAttestations && isValidEmail()
  }

  function isEnabled() {
    return !user?.email || canBuyProduct()
  }

  return product ?
    <div className="container">
      <EventsAppNavBar
        title={product.title}
        transparentDepth={50}
        opaqueDepth={100}
        backPath="../.."
      />

      <AsyncImage
        imageRef={getEventStorageRef(merchant.id, event.id, event.photo)}
        className="headerImage"
        alt={event.title}
      />

      <Spacer y={4} />

      <div className="content">
        <h1 className="header-l">{product.title}</h1>

        <Spacer y={3} />
        <p className="text-body-faded">{product.description}</p>
        {
          product.earliestEntryAt && <div>
            <Spacer y={3} />
            <div style={{ display: "flex", columnGap: 8 }}>
              <h4 className="header-xs">Earliest entry:</h4>
              <p>{format(dateFromTimestamp(product.earliestEntryAt), "do MMM at HH:mm")}</p>
            </div>
            
          </div>
        }
        {
          product.latestEntryAt && <div>
            <Spacer y={3} />
            <div style={{ display: "flex", columnGap: 8 }}>
              <h4 className="header-xs">Latest entry:</h4>
              <p>{format(dateFromTimestamp(product.latestEntryAt), "do MMM") + " at " + format(dateFromTimestamp(product.latestEntryAt), "HH:mm")}</p>
            </div>
            
          </div>
        }
        <Spacer y={3} />

        <h3 className="header-s">Number of tickets</h3>
        <Spacer y={2} />
        <Stepper value={quantity} onChange={(value) => setQuantity(value)} minValue={minQuantity} maxValue={maxQuantity} />
        
        <Spacer y={4} />

        {
          user?.email && <div>
            <h3 className="header-s">Email address</h3>
            <Spacer y={2} />

            <div className="flex-container" style={{ columnGap: 8, justifyContent: "left" }}>
              {
                getEmailDomain() && !validateEmail(user.email, getEmailDomain()) ?
                  <p className="text-body-faded" >
                    {"You need an email address ending in "}
                    <span className="text-body" style={{ fontWeight: 500 }}>{"@" + getEmailDomain()}</span>
                    {" to buy tickets to this event, but you're currently logged in as "}
                    <span className="text-body" style={{ fontWeight: 500 }}>{user.email}</span>
                    .
                  </p> :
                  <p className="text-body-faded" >
                    {"Your tickets will be emailed to "}
                    <span className="text-body" style={{ fontWeight: 500 }}>{user.email}</span>
                    .
                  </p>

              }
              <div className="flex-spacer"/>
              <SmallButton title="Change" buttonTheme={ButtonTheme.MONOCHROME_OUTLINED} onClick={handleChangeEmail} />

            </div>
            <Spacer y={4} />
          </div>
        }

        <h3 className="header-s">Order Summary</h3>
        <Spacer y={2} />
        <OrderSummary 
          lineItems={[
            { title: product.title, quantity, price: product.price }
          ]}
          currency={merchant.currency}
          feePercentage={customerFee}
        />


        <Spacer y={6} />

        {
          user?.email && validateEmail(user.email, getEmailDomain()) &&
          Object.keys(attestationData).map(attestation => {
            return <div>
              <div style={{ display: "flex", columnGap: 16, alignItems: "center" }}>
                <CheckBox length={20} color={Colors.GRAY_LIGHT} value={attestationData[attestation]} onChange={event => setAttestationData({ ...attestationData, [attestation]: event.target.value })} />
                <p className="text-body">{attestation}</p>
              </div>
              <Spacer y={3} />
            </div>
          })
        }
        
        {
          !user?.email && getEmailDomain() && <div>
            <p className="text-body-faded">
              {"You'll need an email ending in "}
              <span className="text-body" style={{ fontWeight: 500 }}>{"@" + getEmailDomain()}</span>
              {" to buy tickets to this event."}
            </p>
            <Spacer y={3} />
          </div>
        }
        <MainButton
          title={user?.email ? "Checkout" : "Log in to continue"}
          sideMessage={formatCurrency(Math.round(product.price * quantity * (1 + customerFee)), merchant.currency)}
          onClick={handleCheckout}
          isLoading={isLoading}
          disabled={!isEnabled()}
          style={{ boxSizing: "borderBox" }}
        />

        {
          user && user.marketingConsentStatus === "PENDING" && <div>
            <Spacer y={2} />
            <div style={{ display: "flex", columnGap: 8, alignItems: "center" }}>
              <CheckBox length={20} color={Colors.GRAY_LIGHT} value={isMarketingConsentApproved} onChange={event => setIsMarketingConsentApproved(event.target.value)} />
              <p className="text-caption">Get notified when this organiser has another relevant event on soon (recommended).</p>
            </div>
          </div>

        }
        <Spacer y={3} />
      </div>
    </div> :
    <LoadingPage />
}