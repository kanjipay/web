import { useState } from "react"
import { useLocation, useNavigate, useParams } from "react-router-dom"
import AsyncImage from "../../../components/AsyncImage"
import CircleButton, { ButtonTheme } from "../../../components/CircleButton"
import Spacer from "../../../components/Spacer"
import "./MenuItemPage.css"
import NavBar from "../../../components/NavBar"
import { Helmet } from "react-helmet"
import Plus from "../../../assets/icons/Plus"
import Minus from "../../../assets/icons/Minus"
import useBasket from "../basket/useBasket"

export default function MenuItemPage({ merchant }) {
  const location = useLocation()
  const navigate = useNavigate()
  const { merchantId, itemId } = useParams()
  const { addItem, basketItems, changeQuantity, removeItem, changeMerchant } = useBasket()
  const { item } = location.state
  const itemInBasket = basketItems.find(basketItem => basketItem.id === item.id)
  const isInCart = !!itemInBasket
  const itemCountInBasket = itemInBasket ? itemInBasket.quantity : 0

  const maxQuantity = 20
  const minQuantity = isInCart ? 0 : 1

  const initialQuantity = isInCart ? itemCountInBasket : 1
  const [quantity, setQuantity] = useState(initialQuantity)

  function handleAddToBasket() {
    if (basketItems.filter(basketItem => basketItem.merchantId === item.merchantId).length === 0) {
      changeMerchant(merchant)
    }

    if (isInCart) {
      quantity === 0 ? removeItem(item) : changeQuantity({ itemId: item.id, quantity })
    } else {
      addItem(item)
      changeQuantity({ itemId: item.id, quantity })
    }
    navigate(-1)
  }

  function incrementQuantity() {
    if (quantity < maxQuantity) {
      setQuantity(quantity + 1)
    }
  }

  function decrementQuantity() {
    if (quantity > minQuantity) {
      setQuantity(quantity - 1)
    }
  }

  return (
    <div className="MenuItemPage container">
      <Helmet>
        <title>{item.title}</title>
      </Helmet>

      <NavBar
        title={item.title}
        transparentDepth={100}
        opaqueDepth={150}
      />

      <AsyncImage
        storagePath={`merchants/${merchantId}/menu_items/${itemId}/${item.photo}`}
        className="headerImage"
        alt={item.title}
      />

      <Spacer y={3} />
      <div className="MenuItemPage__content">
        <h1 className="MenuItemPage__title header-l">{item.title}</h1>
        <Spacer y={1} />
        <p className="MenuItemPage__description text-body-faded">{item.description}</p>
        <Spacer y={3} />
        <h3 className="header-s">Number of items</h3>
        <Spacer y={1} />
        <div className="MenuItemPage__counter">
          <CircleButton
            Icon={Minus}
            buttonTheme={ButtonTheme.PRIMARY}
            onClick={() => decrementQuantity()}
            disabled={quantity <= minQuantity}
          />
          <div className="MenuItemPage__counterValue">
            {quantity}
          </div>
          <CircleButton
            Icon={Plus}
            buttonTheme={ButtonTheme.PRIMARY}
            onClick={() => incrementQuantity()}
            disabled={quantity >= maxQuantity}
          />
        </div>
      </div>

      <div className="anchored-bottom">
        <button
          className="btn btn-primary btn-main"
          onClick={() => handleAddToBasket()}
        >
          { isInCart ? quantity === 0 ? "Remove from basket" : "Edit amount" : "Add to basket" }
        </button>
      </div>
    </div>
  )
}