import { useEffect, useState } from "react";
import Minus from "../../../../assets/icons/Minus";
import Plus from "../../../../assets/icons/Plus";
import AsyncImage from "../../../../components/AsyncImage";
import IconButton, { ButtonTheme, Colors } from "../../../../components/CircleButton";
import MainButton from "../../../../components/MainButton";
import Spacer from "../../../../components/Spacer";
import { formatCurrency } from "../../../../utils/helpers/money";
import { getEventStorageRef } from "../../../../utils/helpers/storage";
import LoadingPage from "../../../../components/LoadingPage"
import { useOpenAuthPage } from "../../../auth/useOpenAuthPage";
import { useLocation, useNavigate } from "react-router-dom";
import SmallButton from "../../../../components/SmallButton";
import EventsAppNavBar from "../secure/EventsAppNavBar";
import { MarketingConsent, setMarketingConsent } from "../../../../utils/services/UsersService";
import { Checkbox } from "@mui/material";
import CheckBox from "../../../../components/CheckBox";
import { auth } from "../../../../utils/FirebaseUtils";
import Stepper from "../../../../components/Stepper";

export default function ProductPage({ merchant, event, product, user }) {
  const [quantity, setQuantity] = useState(1)
  const productId = product.id
  const openAuthPage = useOpenAuthPage()
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const isMarketingConsentShowing = user && user.marketingConsentStatus === "PENDING"

  const [isMarketingConsentApproved, setIsMarketingConsentApproved] = useState(true)
  const [isLoading, setIsLoading] = useState(false)

  const maxQuantity = event.maxTicketsPerPerson ?? 10
  const minQuantity = 1

  const incrementQuantity = () => {
    if (quantity < maxQuantity) {
      setQuantity(quantity + 1);
    }
  };

  const decrementQuantity = () => {
    if (quantity > minQuantity) {
      setQuantity(quantity - 1);
    }
  };

  const handleCheckout = () => {
    if (user && user.email) {
      function navigateToTicketsPage() {
        const state = {
          productId,
          quantity,
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
        requiresPassword: false
      })
    }
    
  }

  const handleChangeEmail = () => {
    openAuthPage({ 
      successPath: window.location.pathname, 
      requiresPassword: false
    })
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
        <h1 className="header-l">{event.title}</h1>
        <Spacer y={1} />
        <p className="text-body">{product.title}</p>

        <Spacer y={4} />

        <h3 className="header-s">Number of items</h3>
        <Spacer y={2} />
        <Stepper value={quantity} onChange={(value) => setQuantity(value)} minValue={minQuantity} maxValue={maxQuantity} />
        
        <Spacer y={4} />

        {
          user?.email && <div>
            <h3 className="header-s">Email address</h3>
            <Spacer y={2} />

            <div className="flex-container" style={{ columnGap: 8, justifyContent: "left" }}>
              <p className="text-body-faded">
                {"Your tickets will be emailed to "}
                <span className="text-body-faded" style={{ fontWeight: 500 }}>{user.email}</span>
                .
              </p>
              <div className="flex-spacer"/>
              <SmallButton title="Change" buttonTheme={ButtonTheme.MONOCHROME_OUTLINED} onClick={handleChangeEmail} />

            </div>
            
          </div>
        }
      </div>

      <div className="anchored-bottom">
        <div style={{ margin: 16 }}>
          <MainButton
            title="Checkout"
            sideMessage={formatCurrency(product.price * quantity) }
            onClick={handleCheckout}
            isLoading={isLoading}
            style={{ boxSizing: "borderBox" }}
          />
          
          {
            user && user.marketingConsentStatus === "PENDING" && <div>
              <Spacer y={2} />
              <div style={{ display: "flex", columnGap: 8, alignItems: "center" }}>
                <CheckBox length={20} color={Colors.GRAY_LIGHT} value={isMarketingConsentApproved} onChange={(value) => setIsMarketingConsentApproved(value)} />
                <p className="text-caption">Get notified when this organiser has another relevant event on soon (recommended).</p>
              </div>
            </div>
            
          }
        </div>
      </div>
    </div> :
    <LoadingPage />
}