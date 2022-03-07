import { useParams } from 'react-router-dom'
import { Helmet } from 'react-helmet';
import NavBar from '../../../../components/NavBar';
import Spacer from '../../../../components/Spacer';



function MerchantOrderPage (props) {
    const {orderList, menuItems} = props
    const { orderId } = useParams()
    var orderListString = ""

    console.log('MerchantOrderPage orderId', orderId)
    console.log('MerchantOrderPage orderList', orderList)
    console.log('MerchantOrderPage menuItems', menuItems)

    const order = orderList.filter(order => order.id === orderId)
    const orderIdIsNotValid = order.length != 1;
    

    console.log('MerchantOrderPage Order', order)
    
    //Here we join each element of the individual item to the menu. This is done locally to minimize network calls needed. 
    const enrichedOrderItemElements = order[0].menu_items.map((orderItem)  => {
        const menuItem = menuItems.find(x => x.id === orderItem.id)
        const enrichedOrderItemElement = { orderItem, menuItem };
        return enrichedOrderItemElement
    });



    return ( orderIdIsNotValid ?
        <div> Naughty naughty, you shouldn't be here </div>: //TODO make this professional
        
        // <div>Hi</div>

        <div className='container'>
      <Helmet>
        <title>Order #TODO</title>
      </Helmet>

    //   <NavBar
        title='Order #TODO'
        transparentDepth={50}
        opaqueDepth={100}
        showsBackButton={true}
      />
      <Spacer y={3} />
        <h1>Details</h1>



      </div>
    )


}

export default MerchantOrderPage;
