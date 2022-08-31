import { Route, Routes, useParams } from "react-router-dom"
import LoadingPage from "../../../../components/LoadingPage"
import ProductPage from "./ProductPage"

export default function Product({ merchant, event, products, user }) {
  const { productId } = useParams()
  const product = products?.find(p => p.id === productId)

  return <Routes>
    <Route
      path="/"
      element={
        <ProductPage
          merchant={merchant}
          event={event}
          product={product}
          user={user}
        />
      }
    />
  </Routes>
}
