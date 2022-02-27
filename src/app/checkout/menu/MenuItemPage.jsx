import { useLocation, useParams } from "react-router-dom"
import AsyncImage from "../../../components/AsyncImage"
import "./MenuItemPage.css"

export default function MenuItemPage() {
  const location = useLocation()
  const { merchantId, itemId } = useParams()
  const { item } = location.state
  console.log(location.state)
  return (
    <div className="MenuItemPage">
      <AsyncImage
        storagePath={`merchants/${merchantId}/menu_items/${itemId}/${item.photo}`}
        className="MenuItemPage__headerImage"
      />
      <div className="MenuItemPage__content">
        <h1 className="MenuItemPage__title">{item.title}</h1>
        <p className="MenuItemPage__description">{item.description}</p>
        <button className="MenuItemPage__button">Add to basket</button>
      </div>
    </div>

  )
}