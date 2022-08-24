import { Link } from "react-router-dom"
import AsyncImage from "./AsyncImage"
import { Colors } from "../enums/Colors"
import Spacer from "./Spacer"
import "./Listing.css"
import SquareLabel from "./SquareLabel"
import { useState } from "react"

export function Flex({ children, columnGap, style, ...props }) {
  return <div style={{ display: "flex", alignItems: "center", ...style }} {...props}>
    {children}
  </div>
}

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

  const newListing = <div
    onMouseEnter={() => setIsHovering(true)}
    onMouseLeave={() => setIsHovering(false)}
    style={{
      aspectRatio: "1/1",
      width: "100%",
      position: "relative"
    }}
  >
    <AsyncImage
      imageRef={imageRef}
      style={{ width: "100%", height: "100%", position: "absolute" }}
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
    <div
      style={{
        width: "100%",
        position: "absolute",
        bottom: 0
      }}
    >
      <div className="fade-gradient" style={{ height: 128 }}/>
      <div style={{ backgroundColor: Colors.OFF_BLACK, padding: "0px 16px 16px 16px" }}>
        <Flex columnGap={8}>
          <h3 className="header-s" style={{ color: Colors.WHITE, flexShrink: 2 }}>{title}</h3>
          <div className="flex-spacer" style={{ minWidth: 16 }} />
          {rightBubbleText && (
            <SquareLabel
              backgroundColor={Colors.WHITE}
              foregroundColor={Colors.BLACK}
            >
              {rightBubbleText}
            </SquareLabel>
          )}
        </Flex>
        <Spacer y={1} />
        <p style={{ 
          textOverflow: "ellipsis",
          overflow: "hidden",
          whiteSpace: "nowrap",
          color: Colors.OFF_WHITE
        }}>{description}</p>
      </div>
    </div>
  </div>

  return isAvailable && linkPath ? (
    <Link to={linkPath} state={linkState} {...props}>
      {newListing}
    </Link>
  ) : (
    <div {...props}>{newListing}</div>
  )
}
