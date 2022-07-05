import { Divider } from "@mui/material"
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { ButtonTheme } from "../../../../components/ButtonTheme"
import TextField from "../../../../components/Input"
import MainButton from "../../../../components/MainButton"
import OrDivider from "../../../../components/OrDivider"
import Spacer from "../../../../components/Spacer"
import { formatCurrency } from "../../../../utils/helpers/money"
import { validateEmail } from "../../../../utils/helpers/validation"
import { sendOrderReceipt } from "../../../../utils/services/OrdersService"
import { Colors } from "../../../../enums/Colors"
import ResultBanner, { ResultType } from "../../../../components/ResultBanner"
import NotFound from "../../../shared/NotFoundPage"
import { LocalStorageKeys } from "../../../../utils/IdentityManager"

export default function OrderConfirmationPage({ order }) {
  const navigate = useNavigate()
  const initialEmail = localStorage.getItem(LocalStorageKeys.EMAIL) ?? ""
  const [isLoading, setIsLoading] = useState(false)
  const [email, setEmail] = useState(initialEmail)

  const { merchantId, status } = order

  function handleSendEmail() {
    setIsLoading(true)

    localStorage.setItem(LocalStorageKeys.EMAIL, email)

    sendOrderReceipt(order.id, email)
      .then((res) => {
        setIsLoading(false)
        navigate("../email-submitted")
      })
      .catch((err) => {
        console.log(err)
        setIsLoading(false)
      })
  }

  function handleEmailFieldChange(event) {
    setEmail(event.target.value)
  }

  if (status === "PAID") {
    return (
      <div className="container">
        <div className="content">
          <Spacer y={3} />

          <ResultBanner
            resultType={ResultType.SUCCESS}
            message="Your payment was successful"
          />
          <Spacer y={3} />
          <h1 className="header-l">We're preparing your order</h1>
          <Spacer y={2} />
          <p className="text-body-faded">
            Thanks for buying from us - we hope you enjoy your meal!
          </p>

          <Spacer y={3} />
          <h3 className="header-s">Order summary</h3>
          <Spacer y={2} />
          {order.orderItems.map((item) => {
            return (
              <div key={item.menuItemId}>
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
            )
          })}
          <Divider />
          <Spacer y={2} />
          <div className="flex-container">
            <div className="header-xs">Total</div>
            <div className="flex-spacer" />
            <div className="header-xs">{formatCurrency(order.total)}</div>
          </div>

          <Spacer y={3} />
          <p className="header-xs" style={{ textAlign: "center" }}>
            Order number
          </p>
          <p
            style={{
              textAlign: "center",
              color: Colors.PRIMARY,
              fontSize: 80,
              fontWeight: 500,
            }}
          >
            {order.orderNumber}
          </p>

          {!order.receiptSent && (
            <div>
              <Spacer y={5} />
              <h3 className="header-s">Get a receipt</h3>
              <Spacer y={1} />
              <p className="text-body-faded">
                Enter your email to get a receipt for your purchase
              </p>
              <Spacer y={2} />
              <TextField
                placeholder="Email"
                type="email"
                name="email"
                autocomplete="on"
                value={email}
                onChange={handleEmailFieldChange}
              />
              <Spacer y={1} />
              <MainButton
                title="Email my receipt"
                isLoading={isLoading}
                disabled={!validateEmail(email)}
                onClick={handleSendEmail}
              />
              <Spacer y={2} />
              <OrDivider />
              <Spacer y={2} />
              <MainButton
                title="Skip"
                buttonTheme={ButtonTheme.SECONDARY}
                onClick={() => navigate(`/menu/${merchantId}`)}
              />
              <Spacer y={8} />
            </div>
          )}
        </div>

        {order.receiptSent && (
          <div className="anchored-bottom">
            <div style={{ margin: "16px" }}>
              <MainButton
                title="Done"
                style={{ boxSizing: "borderBox" }}
                onClick={() => navigate(`/menu/${merchantId}`)}
              />
            </div>
          </div>
        )}
      </div>
    )
  } else {
    return <NotFound />
  }
}
