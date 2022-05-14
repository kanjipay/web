import { useEffect, useState } from "react";
import Minus from "../../../../assets/icons/Minus";
import Plus from "../../../../assets/icons/Plus";
import AsyncImage from "../../../../components/AsyncImage";
import CircleButton, { ButtonTheme, Colors } from "../../../../components/CircleButton";
import MainButton from "../../../../components/MainButton";
import Spacer from "../../../../components/Spacer";
import { formatCurrency } from "../../../../utils/helpers/money";
import { getEventStorageRef } from "../../../../utils/helpers/storage";
import LoadingPage from "../../../../components/LoadingPage"
import { useOpenAuthPage } from "../auth/useOpenAuthPage";
import { useLocation, useNavigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import SmallButton from "../../../../components/SmallButton";
import EventsAppNavBar from "../secure/EventsAppNavBar";
import { auth } from "../../../../utils/FirebaseUtils";

export default function ProductPage({ merchant, event, product }) {
  const [quantity, setQuantity] = useState(1)
  const productId = product.id
  const openAuthPage = useOpenAuthPage()
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const [user, setUser] = useState(auth.currentUser)

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
    const state = {
      productId,
      quantity,
      backPath: pathname
    }

    navigate("/events/s/orders/tickets", { state })
  }

  const handleChangeEmail = () => {
    openAuthPage(window.location.pathname)
  }

  useEffect(() => {
    onAuthStateChanged(auth, user => {
      setUser(user)
    })
  }, [])

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
        <div
          style={{ display: "flex", columnGap: 8 }}
        >
          <CircleButton
            Icon={Minus}
            length={32}
            buttonTheme={ButtonTheme.MONOCHROME}
            onClick={decrementQuantity}
            disabled={quantity <= minQuantity}
          />
          <div style={{ 
            height: 32, 
            width: 32, 
            borderRadius: 16, 
            display: "flex", 
            alignItems: "center", 
            justifyContent: "center", 
            backgroundColor: Colors.OFF_WHITE_LIGHT 
          }}>{quantity}</div>
          <CircleButton
            Icon={Plus}
            length={32}
            buttonTheme={ButtonTheme.MONOCHROME}
            onClick={incrementQuantity}
            disabled={quantity >= maxQuantity}
          />
        </div>

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
            style={{ boxSizing: "borderBox" }}
          />
        </div>
      </div>
    </div> :
    <LoadingPage />
}