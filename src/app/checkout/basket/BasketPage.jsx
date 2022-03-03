import { Helmet } from "react-helmet";
import NavBar from "../../../components/NavBar";
import Spacer from "../../../components/Spacer";
import MainButton from "../../../components/MainButton";
import { formatCurrency } from "../../../utils/helpers/money";
import BasketItem from "./BasketItem";
import useBasket from "./useBasket";
import Divider from '@mui/material/Divider';
import { Link } from "react-router-dom";

export default function BasketPage({ merchant }) {
  const { total, basketItems } = useBasket()

  const titleElement = <div style={{ textAlign: "center" }}>
    <div className="header-xs">Basket</div>
    { merchant && <div className="text-caption">{merchant.display_name}</div> }
  </div>

  console.log(basketItems)

  return (
    <div className="BasketPage container">
      <Helmet>
        <title>Your basket</title>
      </Helmet>

      <NavBar titleElement={titleElement}/>

      <Spacer y={9} />
      <div className="content">
        {/* <h3 className="header-s">Cutlery</h3>
        <Spacer y={3} /> */}

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
        <div style={{ margin: "8px" }}>
          <Link to="../checkout">
            <MainButton title="Proceed to checkout" style={{ boxSizing: "borderBox" }} />
          </Link>
        </div>
      </div>
    </div>
  )
}