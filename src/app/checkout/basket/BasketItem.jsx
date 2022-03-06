import { formatCurrency } from "../../../utils/helpers/money";
import "./BasketItem.css"

export default function BasketItem({ item }) {
  return <div className="flex-container">
    <div className="BasketItem__count">{item.quantity}</div>
    <div className="text-body">{item.title}</div>
    <div className="BasketItem__spacer" />
    <div className="text-body-faded">{formatCurrency(item.price * item.quantity)}</div>
  </div>
}