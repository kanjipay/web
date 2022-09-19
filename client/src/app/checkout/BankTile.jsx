import FlexSpacer from "../../components/layout/FlexSpacer"
import { Flex } from "../../components/Listing"
import { Body, FeedbackProvider } from "../auth/AuthPage"
import "./BankTile.css"

export default function BankTile({ name, imageRef, ...props }) {
  return <FeedbackProvider>{(isHovering) => <Flex
    columnGap={16}
    test-name="bank-tile"
    test-id={`bank-tile-${name.toLowerCase().replace(" ", "-")}`}
    style={{ opacity: isHovering ? 0.8 : 1 }}
    {...props}
  >
    <img
      alt={name}
      src={imageRef}
      style={{ width: 40, height: 40, margin: "auto" }}
    />
    <Body>{name}</Body>
    <FlexSpacer />
  </Flex>}</FeedbackProvider>
}
