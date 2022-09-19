import { useEffect } from "react";
import { useState } from "react";
import { isMobile } from "react-device-detect";
import Dropdown from "../../components/input/Dropdown";
import { FloatField, IntField } from "../../components/input/IntField";
import Content from "../../components/layout/Content";
import { Flex } from "../../components/Listing";
import Spacer from "../../components/Spacer";
import { Colors } from "../../enums/Colors";
import { AnalyticsManager } from "../../utils/AnalyticsManager";
import { formatCurrency } from "../../utils/helpers/money";
import { Body } from "../auth/AuthPage";
import { Container } from "./FAQsPage";

export default function PricingPage() {
  const [data, setData] = useState({
    quantity: 100,
    price: 15.00,
    currency: navigator.language === "en-GB" ? "GBP" : "EUR",
    openBankingProportion: 0.8,
    feeStructure: "customer"
  })

  const { quantity, price, currency, feeStructure, openBankingProportion } = data
  const priceInCents = Math.round(price * 100)

  const onChange = event => {
    const { name, value } = event.target
    setData({ ...data, [name]: value })
  }

  const bookingFee = Math.round(priceInCents * 0.1)
  const mercadoFee = Math.round(priceInCents * 0.03)

  const ticketValue = priceInCents + (feeStructure === "customer" ? bookingFee : 0)
  const paymentProcessingCosts = priceInCents === 0 ? 0 : (1 - openBankingProportion) * (ticketValue * 0.014 + 16)
  const ticketEarnings = ticketValue - paymentProcessingCosts - mercadoFee

  const earnings = quantity * ticketEarnings
  const elasticity = 1.1

  const eventbriteTicketValue = feeStructure === "customer" ? priceInCents * (1.078) + 59 : priceInCents
  const pricePercChange = (eventbriteTicketValue - ticketValue) / eventbriteTicketValue
  const eventbriteTicketEarnings = feeStructure === "customer" ? priceInCents : priceInCents * (1 - 0.078) - 59
  const eventbriteEarnings = eventbriteTicketEarnings * quantity * (1 - pricePercChange * elasticity)

  useEffect(() => AnalyticsManager.main.viewPage("Pricing"), [])

  return <Container maxWidth={1200}>
    <Content paddingTop={160}>
      <h1 style={{ textAlign: "center", fontSize: "3em", fontFamily: "Rubik, sans-serif", fontWeight: 600 }}>See how much you can save with us</h1>

      <Spacer y={12} />
      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", columnGap: 64, rowGap: 32 }}>
        <div>
          <p className="header-xs">Ticket price</p>
          <Spacer y={1} />
          <Flex columnGap={0}>
            <Dropdown
              name="currency"
              value={currency}
              onChange={onChange}
              optionList={[
                { value: "GBP", label: "£" },
                { value: "EUR", label: "€" },
              ]}
              style={{ backgroundColor: Colors.OFF_WHITE, flexShrink: 100 }}
            />
            <FloatField
              value={price}
              name="price"
              onChange={onChange}
            />
          </Flex>

          <Spacer y={3} />

          <p className="header-xs">Tickets sold</p>
          <Spacer y={1} />
          <IntField onChange={onChange} value={quantity} name="quantity" />

          <Spacer y={3} />

          <p className="header-xs">Fee structure</p>
          <Spacer y={1} />
          <Flex columnGap={16}>
            <Dropdown
              name="feeStructure"
              value={feeStructure}
              onChange={onChange}
              optionList={[
                { value: "customer", label: "Pass booking fee to attendee" },
                { value: "merchant", label: "Absorb booking fee" },
              ]}
              style={{ width: "100%" }}
            />

            <p style={{ flexShrink: 0 }}>Attendee pays {formatCurrency(ticketValue, currency)}</p>
          </Flex>
          <Spacer y={2} />
          <Body isFaded>{
            feeStructure === "customer" ?
              `We'll charge attendees a ${formatCurrency(bookingFee, currency)} booking fee per ticket, and give you back ${formatCurrency(bookingFee - mercadoFee, currency)} minus our payment processing costs.` :
              `We won't charge attendees a booking fee, and will charge you ${formatCurrency(mercadoFee, currency)} plus our payment processing costs.`
          }</Body>
        </div>

        <div style={{ textAlign: "center" }}>
          <div style={{ backgroundColor: Colors.BLACK, borderRadius: 8, padding: "32px 0" }}>
            <p style={{ color: Colors.WHITE }}>Your estimated event earnings</p>
            <Spacer y={1} />
            <p style={{ fontSize: "6em", fontWeight: 600, color: Colors.WHITE }}>{formatCurrency(earnings, currency, false)}</p>
          </div>

          <Spacer y={2} />

          <div style={{ backgroundColor: Colors.OFF_WHITE_LIGHT, borderRadius: 8, padding: "32px 32px" }}>
            <Flex columnGap={8} style={{ justifyContent: "center" }}>
              <p>Earnings with Eventbrite: </p>
              <p style={{ color: Colors.RED, fontWeight: 600, fontSize: "1.1em" }}>{formatCurrency(eventbriteEarnings, currency, false)}</p>
            </Flex>
            {
              pricePercChange > 0 && <div>
                <Spacer y={3} />
                <p>Attendee pays {formatCurrency(eventbriteTicketValue, currency)}, so you'll sell fewer tickets.</p>
              </div>
            }
          </div>
        </div>
      </div>
    </Content>
  </Container>
}