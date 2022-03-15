import Box from "@mui/material/Box";
// import { styled } from "@mui/material/styles";
import Grid from "@mui/material/Grid";
import { Link } from "react-router-dom";
// import AlertIcon from "../../../../components/AlertIcon";
// import Paper from "@mui/material/Paper";
import { getTimeFromUnixTimestamp } from "../../../../utils/helpers/time";
import "./MerchantOrder.css";
import { Colors } from "../../../../components/CircleButton";
// import { Col } from "react-bootstrap";

function OrderItem(props) {
  const { order, menuItems } = props;
  var orderListString = "";
  const orderTime = getTimeFromUnixTimestamp(order.created_at.seconds);

  //Here we join each element of the individual item to the menu. This is done locally to minimize network calls needed.
  const enrichedOrderItemElements = order.order_items.map((orderItem) => {
    const menuItem = menuItems.find((x) => x.id === orderItem.menu_item_id);
    const enrichedOrderItemElement = { orderItem, menuItem };
    return enrichedOrderItemElement;
  });

  //Here we build up a string that will contain what is in the order
  for (var enrichedOrderItem of enrichedOrderItemElements) {
    const name = enrichedOrderItem.menuItem.title;
    const quantity = enrichedOrderItem.orderItem.quantity;

    if (orderListString.length === 0) {
      orderListString = orderListString.concat(quantity, "x ", name);
    } else {
      orderListString = orderListString.concat(", ", quantity, "x ", name);
    }
  }

  //   const backgroundColor = index % 2 === 1 ? "#D3D3D3" : "";

  //Leaving this ugly for now - all of the core functionality is here
  return (
    <Link to={`order/${order.id}`}>
      <Box
        sx={{
          width: 500,
        }}
      >
        <Grid container spacing={2}>
          <Grid item xs={2}>
            <div className="MerchantOrder__numberCircle">
              {" "}
              {order.order_number}{" "}
            </div>
          </Grid>

          <Grid item xs={9}>
            <Box sx={{ width: 1 }}>
              <Box display="grid" gridTemplateColumns="repeat(12, 1fr)" gap={2}>
                <Box gridColumn="span 2">
                  <h2 className="header-s">Order</h2>
                </Box>
                <Box gridColumn="span 10">
                  {/* <AlertIcon /> */}
                  {/* <div className="MerchantOrder__orderStatusContainer">
                    <p className="MerchantOrder__orderStatusText">Active</p>
                  </div> */}
                  <div className="flex-container">
                    <div
                      className="bubble"
                      style={{
                        color: Colors.LIGHT_GREEN,
                        backgroundColor: Colors.GREEN,
                      }}
                    >
                      Active
                    </div>

                    <div className="flex-spacer"></div>
                  </div>
                </Box>
                <Box gridColumn="span 12">
                  <div className="text-body-faded">{orderListString}</div>
                </Box>
              </Box>
            </Box>
          </Grid>

          <Grid item xs={1}>
            <h2> {orderTime}</h2>
          </Grid>
        </Grid>
      </Box>
      <div
        className="flex-spacer"
        style={{ height: 1, backgroundColor: Colors.OFF_WHITE }}
      />{" "}
    </Link>
  );
}

export default OrderItem;
