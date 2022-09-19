import { Route, Routes, useParams } from "react-router-dom"
import ProductPage from "./ProductPage"
import ProductRedirectPage from "./ProductRedirectPage"

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
    <Route path="/redirect" element={<ProductRedirectPage product={product} event={event} merchant={merchant} user={user} />} />
  </Routes>
}
