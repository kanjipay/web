import { useContext } from "react"
import { BasketContext } from "./BasketContext"

export default function useBasket() {
  const ctx = useContext(BasketContext)

  return { ...ctx }
}