import { formatCurrency } from "../../../utils/helpers/money";
import "./BasketItem.css"
import CircleButton, { ButtonTheme } from "../../../components/CircleButton"
import Minus from "../../../assets/icons/Minus"
import Plus from "../../../assets/icons/Plus"
import Cross from "../../../assets/icons/Cross"
import useBasket from "./useBasket";

export default function BasketItem({ item, isEditing = false }) {
  const { changeQuantity, removeItem } = useBasket()

  const minQuantity = 1
  const maxQuantity = 20

  return <div className="BasketItem flex-container">
    { isEditing && <CircleButton
      length={28}
      Icon={Cross}
      buttonTheme={ButtonTheme.DESTRUCTIVE}
      style={{ marginRight: 12, borderRadius: "0 8px 8px 0" }}
      onClick={() => removeItem(item)}
     /> }
    { isEditing && <CircleButton
      length={28}
      Icon={Minus}
      buttonTheme={ButtonTheme.PRIMARY}
      disabled={item.quantity <= minQuantity}
      onClick={() => changeQuantity({ itemId: item.id, quantity: item.quantity - 1 })}
     /> }
    <div className="BasketItem__count" style={{ marginLeft: isEditing ? 0 : 16 }}>{item.quantity}</div>
    { isEditing && <CircleButton
      length={28}
      Icon={Plus}
      buttonTheme={ButtonTheme.PRIMARY}
      disabled={item.quantity >= maxQuantity}
      onClick={() => changeQuantity({ itemId: item.id, quantity: item.quantity + 1 })}
    /> }
    <div className="text-body" style={{ marginLeft: 4 }}>{item.title}</div>
    <div className="BasketItem__spacer" />
    <div className="text-body-faded">{formatCurrency(item.price * item.quantity)}</div>
  </div>
}