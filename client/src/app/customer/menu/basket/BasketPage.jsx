import { Helmet } from "react-helmet-async";
import NavBar from "../../../../components/NavBar";
import Spacer from "../../../../components/Spacer";
import MainButton from "../../../../components/MainButton";
import { formatCurrency } from "../../../../utils/helpers/money";
import BasketItem from "./BasketItem";
import useBasket from "./useBasket";
import Divider from "@mui/material/Divider";
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import NavBarButton from "../../../../components/NavBarButton";
import { createMenuOrder } from "../../../../utils/services/OrdersService";
import {
  AnalyticsEvent,
  AnalyticsManager,
  PageName,
  viewPage,
} from "../../../../utils/AnalyticsManager";
import LoadingPage from "../../../../components/LoadingPage";
import OrderType from "../../../../enums/OrderType";

export default function BasketPage({ merchant }) {
  const { total, basketItems } = useBasket();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { merchantId } = useParams();

  const merchantBasketItems = () => basketItems.filter(i => i.merchantId === merchant.id)

  useEffect(() => {
    viewPage(PageName.BASKET, { merchantId });
  }, [merchantId]);

  const titleElement = (
    <div style={{ textAlign: "center" }}>
      <div className="header-xs">Basket</div>
      {merchant && <div className="text-caption">{merchant.displayName}</div>}
    </div>
  );

  const toggleEdit = () => {
    setIsEditing(!isEditing);
  }

  const checkoutItems = () => {
    setIsLoading(true);

    const analyticsManager = AnalyticsManager.main;

    analyticsManager.logEvent(AnalyticsEvent.PRESS_BUTTON, {
      button: "checkout",
    });

    createMenuOrder(merchantId, basketItems)
      .then((res) => {
        const { checkoutUrl, orderId } = res
        setIsLoading(false);
        analyticsManager.logEvent(AnalyticsEvent.CREATE_ORDER, { orderId, orderType: OrderType.MENU });
        window.location.href = checkoutUrl
      })
      .catch((err) => {
        setIsLoading(false);
        console.log(err);
      });
  }

  return merchant ?
    <div className="BasketPage container">
      <Helmet>
        <title>Your basket</title>
      </Helmet>

      <NavBar
        backPath=".."
        titleElement={titleElement}
        rightElements={[
          <NavBarButton
            title={isEditing ? "Done" : "Edit"}
            onClick={toggleEdit}
          />,
        ]}
      />

      <Spacer y={9} />
      <div className="content">
        <h3 className="header-s">Your order</h3>
        <Spacer y={2} />
        {merchantBasketItems().map((item) => {
          return (
            <div key={item.id}>
              <BasketItem item={item} currency={merchant.currency} isEditing={isEditing} />
              <Spacer y={2} />
            </div>
          );
        })}
        <Divider />
        <Spacer y={2} />
        <div className="flex-container">
          <div className="header-xs">Total</div>
          <div className="flex-spacer" />
          <div className="header-xs">{formatCurrency(total, merchant.currency)}</div>
        </div>
      </div>

      <div className="anchored-bottom">
        <div style={{ margin: 16 }}>
          <MainButton
            title="Proceed to checkout"
            isLoading={isLoading}
            style={{ boxSizing: "borderBox" }}
            onClick={checkoutItems}
            disabled={merchantBasketItems().length === 0}
          />
        </div>
      </div>
    </div> :
    <LoadingPage />
}
