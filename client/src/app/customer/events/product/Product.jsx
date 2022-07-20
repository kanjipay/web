import { useEffect, useState } from "react"
import { Route, Routes, useLocation, useParams } from "react-router-dom"
import LoadingPage from "../../../../components/LoadingPage"
import Collection from "../../../../enums/Collection"
import ProductPage from "./ProductPage"

export default function Product({ merchant, event, user }) {
  const { productId } = useParams()
  const location = useLocation()
  const [product, setProduct] = useState(location.state?.product)

  useEffect(() => {
    return Collection.PRODUCT.onChange(productId, setProduct)
  }, [productId])

  if (!product) {
    return <LoadingPage />
  } else {
    return (
      <Routes>
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
    )
  }
}
