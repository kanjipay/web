import { Divider } from "@mui/material"
import { getAuth } from "firebase/auth"
import { onSnapshot } from "firebase/firestore"
import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import LoadingPage from "../../../../../components/LoadingPage"
import MainButton from "../../../../../components/MainButton"
import ResultBanner, { ResultType } from "../../../../../components/ResultBanner"
import Spacer from "../../../../../components/Spacer"
import Collection from "../../../../../enums/Collection"
import { auth } from "../../../../../utils/FirebaseUtils"
import { formatCurrency } from "../../../../../utils/helpers/money"
import EventsAppNavBar from "../EventsAppNavBar"

export default function OrderConfirmationPage() {
  const { orderId } = useParams()
  const navigate = useNavigate()
  const [order, setOrder] = useState(null)

  useEffect(() => {
    const unsub = onSnapshot(Collection.ORDER.docRef(orderId), doc => {
      const order = { id: doc.id, ...doc.data() }
      setOrder(order)
    })

    return unsub
  }, [orderId])

  const currUser = auth.currentUser
  
  if (order) {
    return <div className="container">
      <EventsAppNavBar 
        title="Your tickets"
      />

      <div className="content">
        <Spacer y={9} />

        <ResultBanner
          resultType={ResultType.SUCCESS}
          message="Your payment was successful"
        />
        <Spacer y={3} />
        <h1 className="header-l">Enjoy your event!</h1>
        <Spacer y={2} />
        <p className="text-body-faded">
          We just emailed your tickets to your email address
          <span className="text-body-faded" style={{ fontWeight: 500 }}>{` ${currUser.email}`}</span>
          . The email may take a few moments to go through.
        </p>
        <Spacer y={2} />
        <p className="text-body-faded">
          Alternatively, you can access your tickets by clicking the icon in the top right, which takes you to your profile page.
        </p>

        <Spacer y={3} />
        <h3 className="header-s">Order summary</h3>
        <Spacer y={2} />
        {order.orderItems.map((item) => {
          return (
            <div key={item.productId}>
              <div className="BasketItem flex-container">
                <div className="BasketItem__count" style={{ marginLeft: 16 }}>
                  {item.quantity}
                </div>
                <div className="text-body" style={{ marginLeft: 4 }}>
                  {item.title}
                </div>
                <div className="BasketItem__spacer" />
                <div className="text-body-faded">
                  {formatCurrency(item.price * item.quantity)}
                </div>
              </div>
              <Spacer y={2} />
            </div>
          );
        })}
        <Divider />
        <Spacer y={2} />
        <div className="flex-container">
          <div className="header-xs">Total</div>
          <div className="flex-spacer" />
          <div className="header-xs">{formatCurrency(order.total)}</div>
        </div>
      </div>

      <div className="anchored-bottom">
        <div style={{ margin: "16px" }}>
          <MainButton
            title="Done"
            style={{ boxSizing: "borderBox" }}
            onClick={() => navigate(`/events/s/tickets`)}
          />
        </div>
      </div>
    </div>
  } else {
    return <LoadingPage />
  }
}