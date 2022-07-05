import { useContext } from "react"
import { AttributionContext } from "./AttributionContext"

export default function useAttribution() {
  const context = useContext(AttributionContext)

  return { ...context }
}
