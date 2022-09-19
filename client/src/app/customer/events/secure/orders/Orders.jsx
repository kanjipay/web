import { Route, Routes } from "react-router-dom"
import OrderConfirmationPage from "./OrderConfirmationPage"

export default function Orders({ user }) {
  return (
    <Routes>
      <Route
        path=":orderId/confirmation"
        element={<OrderConfirmationPage user={user} />}
      />
    </Routes>
  )
}
