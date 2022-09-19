import { useState } from "react"
import Carat from "../../assets/icons/Carat"
import Content from "../../components/layout/Content"
import { Flex } from "../../components/Listing"
import Spacer from "../../components/Spacer"
import { Colors } from "../../enums/Colors"
import { Body } from "../auth/AuthPage"

function FAQ({ question, answer, style, ...props }) {
  const [isExpanded, setIsExpanded] = useState(false)
  return <div 
    style={{ 
      borderRadius: 8, 
      backgroundColor: isExpanded ? Colors.OFF_WHITE : Colors.OFF_WHITE_LIGHT, 
      padding: 16,
      cursor: "pointer",
      ...style
    }}
    {...props}
    onClick={() => setIsExpanded(!isExpanded)}
  >
    <Flex columnGap={16}>
      <Carat length={24} style={{ transform: `rotate(${isExpanded ? "180" : "0"}deg)` }} />
      <Body style={{
        fontWeight: isExpanded ? 600 : 400,
      }}>{question}</Body>
    </Flex>

    {
      isExpanded && <div>
        <Spacer y={3} />
        <Body>{answer}</Body>
        
      </div>
    }
  </div>
}

export function Container({ 
  maxWidth = 500,
  children 
}) {
  return <div style={{
    maxWidth,
    minHeight: "100vh",
    position: "relative",
    backgroundColor: Colors.WHITE,
    overflowY: "auto",
    margin: "auto"
  }}>
    {children}
  </div>
}

const faqs = [
  {
    question: "How do I list tickets for my event?",
    answer: "Go to your organiser dashboard by clicking the \"Organisers\" button in the top right, and sign in and create an organisation if you haven't already. Once that's done, create a new event, fill in the event details and create one or more ticket types you want to sell. Once you're happy with the details you've entered, hit publish. Go the \"Event links\" tab, copy your event link and start promoting it!"
  },
  {
    question: "Can I sell free tickets?",
    answer: "Yes, you can sell free tickets completely free of charge."
  },
  {
    question: "How does the pricing work?",
    answer: "We charge a 3% fee plus our payment processing costs, which are 1.4% + £/€0.20 for card payments, and zero for bank transfer payments. Around 80% of event goers pay by bank transfer."
  },
  {
    question: "How can I manage entry to my event?",
    answer: "When someone buys a ticket to your event, they'll be emailed a QR code for each ticket they bought (and will be able to download these to Apple/Google Wallet. You can use our web scanner to check these tickets on the door. If you prefer to check names from a guestlist instead, you can access the list from the dashboard and export as a CSV."
  },
]

export default function FAQsPage() {
  return <Container maxWidth={800}>
    <Content paddingTop={96}>
      <h1 style={{ textAlign: "center", fontSize: "5em", fontFamily: "Rubik, sans-serif", fontWeight: 600 }}>FAQs</h1>
      <Spacer y={6} />

      {
        faqs.map(({ question, answer }) => <FAQ question={question} answer={answer} style={{ marginBottom: 16 }} />)
      }
    </Content>
  </Container>
}