import { orderBy, where } from "firebase/firestore";
import { useEffect, useState } from "react";
import { Route, Routes, useParams } from "react-router-dom";
import LoadingPage from "../../../components/LoadingPage";
import Collection from "../../../enums/Collection";
import CreateProductPage from "./CreateProductPage";
import EventPage from "./EventPage";
import ProductPage from "./ProductPage";

export default function Event({ events, merchant }) {
  const { eventId } = useParams()
  const event = events.find(e => e.id === eventId)
  const [products, setProducts] = useState(null)

  useEffect(() => {
    return Collection.PRODUCT.queryOnChange(
      setProducts,
      where("eventId", "==", eventId),
      orderBy("sortOrder", "asc")
    )
  }, [eventId])

  return products ?
    <Routes>
      <Route path="/" element={<EventPage event={event} products={products} merchant={merchant} />} />
      <Route path="/p/create" element={<CreateProductPage event={event} products={products} merchant={merchant} />} />
      <Route path="/p/:productId" element={<ProductPage event={event} products={products} merchant={merchant} />} />
    </Routes> :
    <LoadingPage />
}