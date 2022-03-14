import { Divider } from "@mui/material"
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { ButtonTheme } from "../../../components/CircleButton"
import Input from "../../../components/Input"
import LoadingPage from "../../../components/LoadingPage"
import MainButton from "../../../components/MainButton"
import OrDivider from "../../../components/OrDivider"
import Spacer from "../../../components/Spacer"
import { formatCurrency } from "../../../utils/helpers/money"
import { validateEmail } from "../../../utils/helpers/validation"
import { sendOrderReceipt } from "../../../utils/services/OrdersService"
import BasketItem from "../basket/BasketItem"

export default function PaymentSuccessPage({ order }) {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  const [email, setEmail] = useState('')

  function handleSendEmail() {
    setIsLoading(true)

    sendOrderReceipt(order.id, email)
      .then(res => {
        setIsLoading(false)
        navigate('../email-submitted')
      })
      .catch(err => {
        console.log(err)
        setIsLoading(false)
      })
  }

  function handleEmailFieldChange(event) {
    setEmail(event.target.value)
  }

  console.log(order)

  return order ?
  <div className="container">
    <div className="content">
      <Spacer y={6} />
      <h1 className="header-l">We're preparing your order</h1>
      <Spacer y={2} />
      <p className="text-body-faded">Thanks for buying from us - we hope you enjoy your meal!</p>

      <Spacer y={3} />
      <h3 className="header-s">Your order</h3>
        <Spacer y={2} />
        {
          order.order_items.map(item => {
            return <div key={item.menu_item_id}>
              <div className="BasketItem flex-container">
                <div className="BasketItem__count" style={{ marginLeft: 16 }}>{item.quantity}</div>
                <div className="text-body" style={{ marginLeft: 4 }}>{item.title}</div>
                <div className="BasketItem__spacer" />
                <div className="text-body-faded">{formatCurrency(item.price * item.quantity)}</div>
              </div>
              <Spacer y={2} />
            </div>
          })
        }
        <Divider />
        <Spacer y={2} />
        <div className="flex-container">
          <div className="header-xs">Total</div>
          <div className="flex-spacer" />
          <div className="header-xs">{formatCurrency(order.total)}</div>
        </div>

      {
        !order.receipt_sent &&
          <div>
            <Spacer y={5} />
            <h3 className="header-s">Get a receipt</h3>
            <Spacer y={1} />
            <p className="text-body-faded">Enter your email to get a receipt for your purchase</p>
            <Spacer y={2} />
            <Input
              placeholder="Email"
              value={email}
              onChange={handleEmailFieldChange}
            />
            <Spacer y={1} />
            <MainButton
              title="Submit email"
              isLoading={isLoading}
              disabled={!validateEmail(email)}
              onClick={() => handleSendEmail()}
            />
            <Spacer y={2} />
            <OrDivider />
            <Spacer y={2} />
            <MainButton title="Skip" buttonTheme={ButtonTheme.SECONDARY} onClick={() => navigate('../..')} />
            <Spacer y={8} />
          </div>
      }
    </div>

    {
      order.receipt_sent &&
        <div className="anchored-bottom">
          <div style={{ margin: "16px" }}>
            <MainButton
              title="Done"
              style={{ boxSizing: "borderBox" }}
              onClick={() => navigate("../..")}
            />
          </div>
        </div>
    }
  </div> :
  <LoadingPage />
}