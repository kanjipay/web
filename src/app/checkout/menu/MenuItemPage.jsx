import { useLocation, useParams } from "react-router-dom"
import AsyncImage from "../../../components/AsyncImage"
import Spacer from "../../../components/Spacer"
import "./MenuItemPage.css"

export default function MenuItemPage() {
  const location = useLocation()
  const { merchantId, itemId } = useParams()
  const { item } = location.state

  return (
    <div className="MenuItemPage container">
      <AsyncImage
        storagePath={`merchants/${merchantId}/menu_items/${itemId}/${item.photo}`}
        className="MenuItemPage__headerImage"
      />
      <Spacer y={3} />
      <div className="MenuItemPage__content">
        <h1 className="MenuItemPage__title header-l">{item.title}</h1>
        <Spacer y={1} />
        <p className="MenuItemPage__description text-body">{item.description}</p>
        <Spacer y={2} />
        <h3 className="header-s">Number of items</h3>
        <Spacer y={1} />
        <p>1</p>
        <Spacer y={3} />
        <p className="MenuItemPage__disclaimer text-disclaimer">
          This is going to be a really long disclaimer. This is going to be a really long disclaimer. This is going to be a really long disclaimer. This is going to be a really long disclaimer. This is going to be a really long disclaimer. This is going to be a really long disclaimer. This is going to be a really long disclaimer. This is going to be a really long disclaimer.
        </p>
        <Spacer y={1} />
        <button className="MenuItemPage__button">Add to basket</button>
      </div>
    </div>

  )
}