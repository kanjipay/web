import { useParams } from "react-router-dom";
import NavBar from "../../../../../components/NavBar";
import Spacer from "../../../../../components/Spacer";
import { useNavigate } from "react-router-dom";
import { setOrderFulfilled } from "../../../../../utils/services/MerchantService";
import CircleIcon from "../../../../../components/CircleIcon";
import Clock from "../../../../../assets/icons/Clock";
import Cutlery from "../../../../../assets/icons/Cutlery";
import MerchantOrderItem from "./MerchantOrderItem";
import Divider from "@mui/material/Divider";
import MainButton from "../../../../../components/MainButton";
import { formatCurrency } from "../../../../../utils/helpers/money";
import { Colors } from "../../../../../enums/Colors";
import { formatTimeForDisplayFromTimestamp } from "../../../../../utils/helpers/time";
import "./MerchantOrderPage.css";

function MerchantOrderPage({ orderList, menuItems }) {
  const navigate = useNavigate();
  const { orderId } = useParams();

  //TODO error handling if this returns more than 1 order
  const filteredOrderList = orderList.filter((order) => order.id === orderId);
  const order = filteredOrderList[0];
  const orderTime = formatTimeForDisplayFromTimestamp(order.paidAt);

  //TODO Implement This in Database Design + Customer Facing App
  const requestedCutlery = true;

  //Here we join each element of the individual item to the menu. This is done locally to minimize network calls needed.
  const enrichedOrderItemElements = order.orderItems.map((orderItem) => {
    const menuItem = menuItems.find((x) => x.id === orderItem.menuItemId);
    const enrichedOrderItemElement = { orderItem, menuItem };
    return enrichedOrderItemElement;
  });

  //Calculate total cost of purchase
  const totalCost = enrichedOrderItemElements.reduce(
    (total, enrichedOrderItemElement) =>
      total +
      enrichedOrderItemElement.menuItem.price *
        enrichedOrderItemElement.orderItem.quantity,
    0
  );

  const handeFulfilment = (orderId) => {
    setOrderFulfilled(orderId);
    navigate(-1);
  };

  return (
    <div className="container">
      <NavBar
        title={`Order # ${order.orderNumber}`}
        transparentDepth={0}
        opaqueDepth={0}
        showsBackButton={true}
      />
      <Spacer y={8} />

      <div className="content">
        <div className="header-s">Details</div>
        <Spacer y={1} />

        <Spacer y={1} />
        <div style={{ display: "flex", alignItems: "center" }}>
          <CircleIcon Icon={Clock} style={{ marginRight: 8 }} />
          <div className="text-body-faded">{`Ordered at ${orderTime}`}</div>
        </div>
        <Spacer y={2} />
        {requestedCutlery ? (
          <div style={{ display: "flex", alignItems: "center" }}>
            <CircleIcon Icon={Cutlery} style={{ marginRight: 8 }} />
            <div className="text-body-faded">Requested cutlery</div>
          </div>
        ) : (
          <Spacer y={10} />
        )}

        <Spacer y={5} />
        <h3 className="header-s">Items</h3>
        <Spacer y={2} />
        {enrichedOrderItemElements.map((enrichedOrderItem, index) => (
          <MerchantOrderItem
            key={index}
            quantity={enrichedOrderItem.orderItem.quantity}
            name={enrichedOrderItem.menuItem.title}
            price={enrichedOrderItem.menuItem.price}
          ></MerchantOrderItem>
        ))}
        <Spacer y={3} />
        <Divider />
        <Spacer y={1} />

        <div className="MerchantOrderPage__totalFlexContainer">
          <h3 className="header-s">Total</h3>
          <div className="flex-spacer" />
          <h3 className="header-s">{formatCurrency(totalCost, order.currency)}</h3>
        </div>

        <Spacer y={2} />
      </div>

      <div
        className="anchored-bottom"
        style={{ backgroundColor: Colors.WHITE }}
      >
        <div style={{ margin: "16px" }}>
          <MainButton
            title="Fulfil Order"
            onClick={() => handeFulfilment(orderId)}
          ></MainButton>
        </div>
      </div>
    </div>
  );
}

export default MerchantOrderPage;
