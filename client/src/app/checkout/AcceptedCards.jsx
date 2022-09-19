import { Flex } from "../../components/Listing";
import { Body } from "../auth/AuthPage";

export function AcceptedCards() {
  return <Flex columnGap={16}>
    <Body isFaded={true}>We accept: </Body>
    <img src="/img/visa.png" alt="Visa" style={{ height: 40 }} />
    <img src="/img/mastercard.png" alt="Mastercard" style={{ height: 32 }} />
    <img src="/img/amex.png" alt="American Express" style={{ height: 32 }} />
  </Flex>
}
