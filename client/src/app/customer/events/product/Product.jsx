import { onSnapshot } from "firebase/firestore";
import { useEffect, useState } from "react";
import { Route, Routes, useLocation, useParams } from "react-router-dom";
import LoadingPage from "../../../../components/LoadingPage";
import Collection from "../../../../enums/Collection";
import ProductPage from "./ProductPage";

export default function Product({ merchant, event }) {
  const { productId } = useParams()
  const location = useLocation()
  const [product, setProduct] = useState(location.state?.product)

  useEffect(() => {
    const unsub = onSnapshot(Collection.PRODUCT.docRef(productId), doc => {
      setProduct({ id: doc.id, ...doc.data() })
    })

    return unsub
  }, [productId])

  return product ? 
    <Routes>
      <Route path="/" element={<ProductPage merchant={merchant} event={event} product={product} />} />
    </Routes> : 
    <LoadingPage />
}