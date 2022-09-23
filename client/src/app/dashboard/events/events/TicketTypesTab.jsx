import { writeBatch } from "firebase/firestore";
import { useState } from "react";
import { Draggable } from "react-drag-reorder";
import { useNavigate } from "react-router-dom";
import { ButtonTheme } from "../../../../components/ButtonTheme";
import MainButton from "../../../../components/MainButton";
import Spacer from "../../../../components/Spacer";
import Collection from "../../../../enums/Collection";
import { db } from "../../../../utils/FirebaseUtils";
import { Body } from "../../../auth/AuthPage";
import ProductListing from "../products/ProductListing";

function move(arr, fromIndex, toIndex) {
  const arrCopy = [...arr]
  const [element] = arrCopy.splice(fromIndex, 1)
  arrCopy.splice(toIndex, 0, element)

  return arrCopy
}

export default function TicketTypesTab({ products, merchant }) {
  const navigate = useNavigate()

  const handleCreateProduct = () => navigate("p/create")

  const handleReorder = (currIndex, newIndex) => {
    const newOrder = move(currOrder, currIndex, newIndex)
    console.log(newOrder)
    setCurrOrder(newOrder)
  }

  const initialOrder = products.map(p => p.id)
  const [currOrder, setCurrOrder] = useState(initialOrder)
  const [isSavingOrder, setIsSavingOrder] = useState(false)
  const orderedProducts = currOrder.map(productId => products.find(p => p.id === productId))
  const hasUpdatedOrder = JSON.stringify(initialOrder) !== JSON.stringify(currOrder)

  const handleSaveOrder = async () => {
    setIsSavingOrder(true)
    const productIds = products.map(p => p.id)

    const batch = writeBatch(db)

    for (const productId of productIds) {
      const oldOrder = initialOrder.indexOf(productId)
      const newOrder = currOrder.indexOf(productId)

      if (oldOrder !== newOrder) {
        batch.update(Collection.PRODUCT.docRef(productId), {
          sortOrder: newOrder + 1
        })
      }
    }

    await batch.commit()
    setIsSavingOrder(false)
  }

  return <div style={{ maxWidth: 500 }}>
    {orderedProducts.length > 0 ? (
      <div>
        <Body isFaded>Tap to edit. Drag to reorder.</Body>
        <Spacer y={3} />
        <MainButton
          title="Create new ticket type"
          onClick={handleCreateProduct}
          test-id="create-product-button"
        />
        {
          hasUpdatedOrder && <MainButton 
            title="Save new order"
            onClick={handleSaveOrder}
            buttonTheme={ButtonTheme.MONOCHROME_OUTLINED}
            isLoading={isSavingOrder}
            style={{ marginTop: 16 }}
          />
        }
        <Spacer y={3} />
        <Draggable onPosChange={handleReorder}>{
          orderedProducts.map((product) => <ProductListing
            product={product}
            key={product.id}
            currency={merchant.currency}
            style={{ marginBottom: 16 }}
          />)
        }</Draggable>
      </div>
    ) : (
      <div>
        <p>
          You don't have any ticket types for this event yet. You'll need
          at least one before you can publish the event.
        </p>
        <Spacer y={3} />
        <MainButton
          title="Create ticket type"
          onClick={handleCreateProduct}
          test-id="create-product-button"
          style={{ padding: "0 16px" }}
        />
      </div>
    )}
  </div>
}