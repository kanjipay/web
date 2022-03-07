import OrderItem from "./MerchantOrder"
import Spacer from "../../../../components/Spacer";

function MerchantOrderList(props) {
  const { orderList, menuItems } = props;

  const debug = orderList.map(x => (
    console.log('MerchantOrderListPage: orderList map', x.menu_items)
  ));

    console.log('MerchantOrderListPage: menuItems', menuItems)

    console.log('MerchantOrderListPage: orderList', orderList)

  return (
    <div>
    <h2 className='header-m'> Order List Page</h2>
    <Spacer y={3} /> 
      {orderList.map((order, index) => (
            <div key={index}>
              <OrderItem {...{ order, menuItems, index }}> </OrderItem>
              <Spacer y={2} />
            </div>
      )) 
}
    </div>

  );
}

export default MerchantOrderList;





