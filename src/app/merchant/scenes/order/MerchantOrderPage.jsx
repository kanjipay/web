import { useParams } from 'react-router-dom'
import { Helmet } from 'react-helmet';
import NavBar from '../../../../components/NavBar';
import Spacer from '../../../../components/Spacer';
import Button from '../../../../components/Button'
import { useNavigate } from 'react-router-dom';
import db from '../../../../utils/services/firestore';
import { doc, updateDoc } from "firebase/firestore";

function MerchantOrderPage (props) {
    const navigate = useNavigate()
    const {orderList, menuItems} = props
    const { orderId } = useParams()
    var orderListString = ""

    console.log('MerchantOrderPage orderId', orderId)
    console.log('MerchantOrderPage orderList', orderList)
    console.log('MerchantOrderPage menuItems', menuItems)

    const filteredOrderList = orderList.filter(order => order.id === orderId)
    const order = filteredOrderList[0]
    const orderIdIsNotValid = filteredOrderList.length != 1;
    

    console.log('MerchantOrderPage Order', order)
    
    //Here we join each element of the individual item to the menu. This is done locally to minimize network calls needed. 
    const enrichedOrderItemElements = order.menu_items.map((orderItem)  => {
        const menuItem = menuItems.find(x => x.id === orderItem.id)
        const enrichedOrderItemElement = { orderItem, menuItem };
        return enrichedOrderItemElement
    });

    //TODO Security Hardening - can we rely on orderIdIsNotValid as the authentication here / is this at all secure? 
    const handeFulfilment = (orderId) => {

        updateDoc(doc(db, "Order", orderId), {
            status: 'FULFILLED'
          });
          navigate(-1)
      };



    return ( orderIdIsNotValid ?
        <div> Naughty naughty, you shouldn't be here </div>: //TODO make this professional
        
        <div className='container'>
      <Helmet>
        <title>'Order #TODO'</title>
      </Helmet>

       <NavBar
        title={order.status}
        transparentDepth={50}
        opaqueDepth={100}
        showsBackButton={true}
      />
      <Spacer y={8} />
      <h3 className="header-s">Details</h3>


      <Spacer y={5} />
      <h3 className="header-s">Items</h3>

      <Spacer y={5} />
      <h3 className="header-s">Total</h3>

      <div className="anchored-bottom">
            <Button title = 'Fulfil Order' handleAction={() => handeFulfilment(orderId)}></Button>
          </div>

      </div>
    )


}

export default MerchantOrderPage;
