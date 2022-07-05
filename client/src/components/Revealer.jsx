import { useState } from "react"
import { ButtonTheme } from "./ButtonTheme"
import MainButton from "./MainButton"

export default function Revealer({ title, children, name }) {
  const [isRevealed, setIsRevealed] = useState(false)

  return (
    <div>
      {!isRevealed && (
        <MainButton
          title={title}
          test-id={`${name}-revealer-button`}
          buttonTheme={ButtonTheme.MONOCHROME_OUTLINED}
          onClick={() => setIsRevealed(true)}
        />
      )}

      {isRevealed && children}
    </div>
  )
}
