import { useParams } from "react-router-dom";
import NavBar from "../../../../components/NavBar";
import Spacer from "../../../../components/Spacer";
import Button from "../../../../components/Button";
import { useNavigate } from "react-router-dom";
import { db } from "../../../../utils/FirebaseUtils";
import {
  collection,
  doc,
  onSnapshot,
  query,
  where,
  getDocs,
  getDoc,
  orderBy,
  updateDoc,
} from "firebase/firestore";
import CircleIcon from "../../../../components/CircleIcon";
import Clock from "../../../../assets/icons/Clock";
import Cutlery from "../../../../assets/icons/Cutlery";
import { getTimeFromUnixTimestamp } from "../../../../utils/helpers/time";
import MerchantOrderItem from "./MerchantOrderItem";
import Divider from "@mui/material/Divider";
import TextLine from "../../../../components/TextLine";
import { Grid } from "@mui/material";
import MainButton from "../../../../components/MainButton";
import { formatCurrency } from "../../../../utils/helpers/money";

function MerchantOrderPage(props) {
  const navigate = useNavigate();
  const { orderList, menuItems } = props;
  const { orderId } = useParams();

  //TODO a better (simpler) way of filtering this
  const filteredOrderList = orderList.filter((order) => order.id === orderId);
  const order = filteredOrderList[0];
  const orderIdIsNotValid = filteredOrderList.length != 1;

  //TODO Implement This in Database Design + Customer Facing App
  const requestedCutlery = true;
  const orderNumber = "003";

  //Here we join each element of the individual item to the menu. This is done locally to minimize network calls needed.
  const enrichedOrderItemElements = order.order_items.map((orderItem) => {
    const menuItem = menuItems.find((x) => x.id === orderItem.menu_item_id);
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
    updateDoc(doc(db, "Order", orderId), {
      status: "FULFILLED",
    });
    navigate(-1);
  };

  return (
    <div className="container">
      <NavBar
        title={`Order # ${order.order_number}`}
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
          <div className="text-body-faded">{`Ordered at ${getTimeFromUnixTimestamp(
            order.created_at.seconds
          )}`}</div>
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
            quantity={enrichedOrderItem.orderItem.quantity}
            name={enrichedOrderItem.menuItem.title}
            price={enrichedOrderItem.menuItem.price}
          ></MerchantOrderItem>
        ))}
        <Spacer y={3} />
        <Divider />
        <Spacer y={1} />

        <Grid container spacing={2}>
          <Grid item xs={4}>
            <h3 className="header-s">Total</h3>
          </Grid>
          <Grid item xs={6.0}></Grid>
          <Grid item xs={2.0}>
            <h3 className="header-s">{formatCurrency(totalCost)}</h3>
          </Grid>
        </Grid>

        <Spacer y={2} />
        </div>

        <div className="anchored-bottom">
        <div style={{margin:"16px"}}>
          <MainButton
            title="Fulfil Order"
            onClick={() => handeFulfilment(orderId)}
          ></MainButton>
          </div>
        </div>

    </div>
  )
}

export default MerchantOrderPage;
