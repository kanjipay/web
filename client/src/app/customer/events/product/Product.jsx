import { useEffect, useState } from "react";
import { Route, Routes, useLocation, useParams } from "react-router-dom";
import LoadingPage from "../../../../components/LoadingPage";
import Collection from "../../../../enums/Collection";
import ProductPage from "./ProductPage";
import IconPage from "../../../../components/IconPage"
import Discover from "../../../../assets/icons/Discover"

export default function Product({ merchant, event, user }) {
  const { productId } = useParams()
  const location = useLocation()
  const [product, setProduct] = useState(location.state?.product)

  useEffect(() => {
    return Collection.PRODUCT.onChange(productId, setProduct)
  }, [productId])

  if (!product) {
    return <LoadingPage />
  } else if (!product.isPublished) {
    return <IconPage
      Icon={Discover}
      title="Coming soon"
      body="The event organiser hasn't published this ticket type yet. Try checking back later."
    />
  } else {
    return <Routes>
      <Route path="/" element={<ProductPage merchant={merchant} event={event} product={product} user={user} />} />
    </Routes>
  }
}