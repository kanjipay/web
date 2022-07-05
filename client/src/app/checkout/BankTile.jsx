import { useState } from "react"
import "./BankTile.css"

export default function BankTile({ name, imageRef, ...props }) {
  const [isHovering, setIsHovering] = useState(false)
  const opacity = isHovering ? 0.8 : 1
  return (
    <div
      {...props}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      test-name="bank-tile"
      test-id={`bank-tile-${name.toLowerCase().replace(" ", "-")}`}
      style={{
        display: "flex",
        columnGap: 16,
        alignItems: "center",
        justifyContent: "left",
        cursor: "pointer",
        opacity,
      }}
    >
      <img
        alt={name}
        src={imageRef}
        style={{ width: 40, height: 40, margin: "auto" }}
      />
      <p className="text-body">{name}</p>
      <div className="flex-spacer"></div>
    </div>
  )
}
