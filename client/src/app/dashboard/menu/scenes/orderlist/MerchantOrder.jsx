import { Link } from "react-router-dom"
import "./MerchantOrder.css"
import { Colors } from "../../../../../enums/Colors"
import { formatTimeForDisplayFromTimestamp } from "../../../../../utils/helpers/time"

function OrderItem({ order, menuItems }) {
  var orderListString = ""

  const orderTime = formatTimeForDisplayFromTimestamp(order.paidAt)

  //Here we join each element of the individual item to the menu. This is done locally to minimize network calls needed.
  const enrichedOrderItemElements = order.orderItems.map((orderItem) => {
    const menuItem = menuItems.find((x) => x.id === orderItem.menuItemId)
    const enrichedOrderItemElement = { orderItem, menuItem }
    return enrichedOrderItemElement
  })

  //Here we build up a string that will contain what is in the order
  for (var enrichedOrderItem of enrichedOrderItemElements) {
    const name = enrichedOrderItem.menuItem.title
    const quantity = enrichedOrderItem.orderItem.quantity

    if (orderListString.length === 0) {
      orderListString = orderListString.concat(quantity, "x ", name)
    } else {
      orderListString = orderListString.concat(", ", quantity, "x ", name)
    }
  }

  return (
    <Link to={`order/${order.id}`}>
      <div className="MerchantOrder__flexContainer">
        <div className="MerchantOrder__numberCircle"> {order.orderNumber} </div>
        <div className="MerchantOrder__textContainer">
          <div className="MerchantOrder__flexSubContainer">
            <h2 className="header-s" style={{ marginRight: "10px" }}>
              Order
            </h2>
            <div
              className="bubble"
              style={{
                color: Colors.LIGHT_GREEN,
                backgroundColor: Colors.GREEN,
              }}
            >
              Active
            </div>
          </div>
          <div className="text-body-faded">{orderListString}</div>
        </div>
        <div className="flex-spacer" />
        <div className="merchantOrder__orderTimeContainer">
          <h2> {orderTime}</h2>
        </div>
      </div>
    </Link>
  )
}

export default OrderItem
