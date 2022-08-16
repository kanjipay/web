import { Link } from "react-router-dom"
import AsyncImage from "./AsyncImage"
import { Colors } from "../enums/Colors"
import Spacer from "./Spacer"
import "./Listing.css"
import SquareLabel from "./SquareLabel"
import { useState } from "react"

export default function Listing({
  imageRef,
  title,
  description,
  rightBubbleText,
  rightCornerText,
  flexItems = [],
  isAvailable = true,
  unavailableMessage = "Not available",
  linkPath,
  linkState = {},
  ...props
}) {
  const [isHovering, setIsHovering] = useState(false)

  const listing = (
    <div 
      className="Listing"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      style={{ opacity: isHovering ? 0.9 : 1}}
    >
      <div className="Listing__imageWrapper">
        <AsyncImage
          className="Listing__image"
          style={{ filter: isAvailable ? "none" : "blur(1px)" }}
          imageRef={imageRef}
        />
        {
          rightCornerText && <div 
            style={{ 
              right: 0, 
              top: 0, 
              padding: "8px 12px", 
              position: "absolute",
              backgroundColor: Colors.BLACK, 
              color: Colors.WHITE,
            }}
          >
            {rightCornerText}
          </div>
        }
        {!isAvailable && <div className="Listing__imageShadow" />}
        {!isAvailable && (
          <SquareLabel
            fontSize={17}
            backgroundColor={Colors.WHITE}
            className="Listing__unavailableBubble"
          >
            {unavailableMessage}
          </SquareLabel>
        )}
      </div>

      <Spacer y={1} />
      <div className="flex-container" style={{ columnGap: 8 }}>
        <h3
          className="Listing__title header-s"
          style={{ color: isAvailable ? Colors.BLACK : Colors.OFF_WHITE_LIGHT }}
        >
          {title}
        </h3>
        {flexItems}
        <div className="flex-spacer" />
        {rightBubbleText && (
          <SquareLabel
            foregroundColor={isAvailable ? Colors.WHITE : Colors.GRAY}
          >
            {rightBubbleText}
          </SquareLabel>
        )}
      </div>
      <Spacer y={1} />
      <p className="Listing__description text-body-faded">{description}</p>
    </div>
  )

  return isAvailable && linkPath ? (
    <Link to={linkPath} state={linkState} {...props}>
      {listing}
    </Link>
  ) : (
    <div {...props}>{listing}</div>
  )
}
