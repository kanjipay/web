import { formatCurrency } from "../../../../utils/helpers/money";
import "./BasketItem.css";
import IconButton, { ButtonTheme } from "../../../../components/CircleButton";
import Minus from "../../../../assets/icons/Minus";
import Plus from "../../../../assets/icons/Plus";
import Cross from "../../../../assets/icons/Cross";
import useBasket from "./useBasket";
import {
  AnalyticsEvent,
  AnalyticsManager,
  PageName,
} from "../../../../utils/AnalyticsManager";

export default function BasketItem({ item, isEditing = false }) {
  const { changeQuantity, removeItem } = useBasket();

  const minQuantity = 1;
  const maxQuantity = 20;

  const removeBasketItem = () => {
    removeItem(item);
    AnalyticsManager.main.logEvent(AnalyticsEvent.REMOVE_FROM_BASKET, {
      itemId: item.id,
      location: PageName.BASKET,
    });
  };

  function changeBasketQuantity(increment) {
    const quantity = item.quantity + increment;
    AnalyticsManager.main.logEvent(AnalyticsEvent.CHANGE_BASKET_AMOUNT, {
      itemId: item.id,
      quantity,
      location: PageName.BASKET,
    });
    changeQuantity({ itemId: item.id, quantity });
  }

  const incrementQuantity = () => changeBasketQuantity(1);
  const decrementQuantity = () => changeBasketQuantity(-1);

  return (
    <div className="BasketItem flex-container">
      {isEditing && (
        <IconButton
          length={28}
          Icon={Cross}
          buttonTheme={ButtonTheme.DESTRUCTIVE}
          style={{ marginRight: 12, borderRadius: "0 8px 8px 0" }}
          onClick={removeBasketItem}
        />
      )}
      {isEditing && (
        <IconButton
          length={28}
          Icon={Minus}
          buttonTheme={ButtonTheme.PRIMARY}
          disabled={item.quantity <= minQuantity}
          onClick={decrementQuantity}
        />
      )}
      <div
        className="BasketItem__count"
        style={{ marginLeft: isEditing ? 0 : 16 }}
      >
        {item.quantity}
      </div>
      {isEditing && (
        <IconButton
          length={28}
          Icon={Plus}
          buttonTheme={ButtonTheme.PRIMARY}
          disabled={item.quantity >= maxQuantity}
          onClick={incrementQuantity}
        />
      )}
      <div className="text-body" style={{ marginLeft: 4 }}>
        {item.title}
      </div>
      <div className="BasketItem__spacer" />
      <div className="text-body-faded">
        {formatCurrency(item.price * item.quantity)}
      </div>
    </div>
  );
}
