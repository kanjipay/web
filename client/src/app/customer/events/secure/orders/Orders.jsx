import { Route, Routes } from "react-router-dom"
import OrderConfirmationPage from "./OrderConfirmationPage"
import OrderTicketsPage from "./OrderTicketsPage"

export default function Orders() {
  return (
    <Routes>
      <Route path="tickets" element={<OrderTicketsPage />} />
      <Route path=":orderId/confirmation" element={<OrderConfirmationPage />} />
    </Routes>
  )
}
