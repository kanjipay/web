import { formatCurrency } from "../../../../utils/helpers/money";
import "./MerchantOrderItem.css";
import Spacer from "../../../../components/Spacer";

function MerchantOrderItem({ quantity, name, price }) {
  const totalPrice = price * quantity;

  return (
    <div>
      <div className="MerchantOrderItem__flexContainer">
        <div className="MerchantOrderItem__numberCircle">{quantity}</div>
        <div>{name}</div>
        <div className="flex-spacer"/>
        <div>{formatCurrency(totalPrice)}</div>
      </div>
      <Spacer y={1}/>
    </div>
  );
}

export default MerchantOrderItem;

