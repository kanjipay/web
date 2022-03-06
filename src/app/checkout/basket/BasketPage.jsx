import { Helmet } from "react-helmet";
import NavBar from "../../../components/NavBar";
import Spacer from "../../../components/Spacer";
import { formatCurrency } from "../../../utils/helpers/money";
import BasketItem from "./BasketItem";
import useBasket from "./useBasket";
import Divider from '@mui/material/Divider';

export default function BasketPage({ merchant }) {
  const { total, basketItems } = useBasket()

  const titleElement = <div style={{ textAlign: "center" }}>
    <div className="header-xs">Basket</div>
    <div className="text-caption">{merchant.display_name}</div>
  </div>

  console.log(basketItems)

  return (
    <div className="BasketPage container">
      <Helmet>
        <title>Your basket</title>
      </Helmet>

      <NavBar titleElement={titleElement}/>

      <Spacer y={8} />
      <div className="content">
        <h3 className="header-s">Cutlery</h3>
        <Spacer y={3} />

        <h3 className="header-s">Your order</h3>
        <Spacer y={2} />
        {
          basketItems.map(item => {
            return <div key={item.id}>
              <BasketItem item={item} />
              <Spacer y={2} />
            </div>
          })
        }
        <Divider />
        <Spacer y={2} />
        <div className="flex-container">
          <div className="header-xs">Total</div>
          <div className="flex-spacer" />
          <div className="header-xs">{formatCurrency(total)}</div>
        </div>

      </div>

      <div className="anchored-bottom">
        <button className="btn btn-primary btn-main">Proceed to checkout</button>
      </div>
    </div>
  )
}