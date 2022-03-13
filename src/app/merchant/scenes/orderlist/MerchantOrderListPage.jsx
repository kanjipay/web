import OrderItem from "./MerchantOrder";
import Spacer from "../../../../components/Spacer";
import BottomNavBar from "../../../../components/BottomNavBar";
import NavBar from "../../../../components/NavBar";

function MerchantOrderList(props) {
  const { orderList, menuItems } = props;

  const debug = orderList.map((x) =>
    console.log("MerchantOrderListPage: orderList map", x.menu_items)
  );

  console.log("MerchantOrderListPage: menuItems", menuItems);

  console.log("MerchantOrderListPage: orderList", orderList);

  return (
    <div className="container">
      <NavBar
        title={`Orders`}
        transparentDepth={0}
        opaqueDepth={0}
        showsBackButton={false}
      />
      <Spacer y={10} />
      <div className="content">
        {orderList.map((order, index) => (
          <div key={index}>
            <OrderItem {...{ order, menuItems, index }}> </OrderItem>
            <Spacer y={2} />
          </div>
        ))}
        <div className="anchored-bottom">
          <BottomNavBar />
        </div>
      </div>
    </div>
  );
}

export default MerchantOrderList;
