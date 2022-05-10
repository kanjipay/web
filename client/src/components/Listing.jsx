import { Link } from "react-router-dom";
import AsyncImage from "./AsyncImage";
import { Colors } from "./CircleButton";
import Spacer from "./Spacer";
import "./Listing.css"
import Bubble from "./Bubble";

export default function Listing({ 
  imageRef, 
  title, 
  description,
  rightBubbleText,
  flexItems = [],
  isAvailable = true, 
  unavailableMessage = "Not available",
  linkPath,
  linkState = {},
}) {
  const textColor = isAvailable ? Colors.BLACK : Colors.GRAY_LIGHT
  const listing = <div className="Listing">
    <div className="Listing__imageWrapper">
      <AsyncImage className="Listing__image" style={{ filter: isAvailable ? "none" : "blur(1px)" }} imageRef={imageRef} />
      {
        !isAvailable && <div className="Listing__imageShadow" />
      }
      {
        !isAvailable && <Bubble fontSize={17} backgroundColor={Colors.WHITE} className="Listing__unavailableBubble">{unavailableMessage}</Bubble>
      }
    </div>
    
    <Spacer y={1} />
    <div className="flex-container" style={{ columnGap: 8 }}>
      <h4 className="Listing__title header-xs" style={{ color: textColor }}>{title}</h4>
      {flexItems}
      <div className="flex-spacer" />
      {
        rightBubbleText && <Bubble foregroundColor={textColor}>{rightBubbleText}</Bubble>
      }
    </div>
    <Spacer y={1} />
    <p className="Listing__description text-body-faded">{description}</p>
  </div>

  return isAvailable && linkPath ?
    <Link to={linkPath} state={linkState}>
      {listing}
    </Link> :
    listing
}

