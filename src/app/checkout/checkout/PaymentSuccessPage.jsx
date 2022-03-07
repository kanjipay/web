import { Divider } from "@mui/material"
import { useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { ButtonTheme } from "../../../components/CircleButton"
import Input from "../../../components/Input"
import MainButton from "../../../components/MainButton"
import OrDivider from "../../../components/OrDivider"
import Spacer from "../../../components/Spacer"
import { validateEmail } from "../../../utils/helpers/validation"
import { sendOrderReceipt } from "../../../utils/services/OrdersService"

export default function PaymentSuccessPage({ order }) {
  const navigate = useNavigate()
  const { orderId } = useParams()
  const [isLoading, setIsLoading] = useState(false)
  const [email, setEmail] = useState('')

  function handleSendEmail() {
    setIsLoading(true)

    sendOrderReceipt(orderId, email)
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

  return <div className="container">
    <div className="content">
      <Spacer y={3} />
      <h1 className="header-l">We're preparing your order</h1>
      <Spacer y={2} />
      <p className="text-body-faded">Thanks for buying from us - we hope you enjoy your meal!</p>

      <Spacer y={3} />
      <Divider />

      <Spacer y={3} />
      <h3 className="header-s">Get a receipt</h3>
      <Spacer y={1} />
      <p>To get a receipt, enter your email</p>
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
  </div>
}