import React from "react"
import { useState } from "react"
import { AnalyticsManager } from "../utils/AnalyticsManager"

export default function Revealer({ trigger, children, name }) {
  const [isRevealed, setIsRevealed] = useState(false)

  const Trigger = React.cloneElement(trigger, {
    onClick: () => {
      if (!isRevealed) {
        setIsRevealed(true)
        AnalyticsManager.main.pressButton("authEmailLink")
      }
    }
  })

  return (
    <div>
      {!isRevealed && Trigger}
      {isRevealed && children}
    </div>
  )
}
