import Box from '@mui/material/Box';
import { styled } from '@mui/material/styles';
import Grid from '@mui/material/Grid';
import { Link } from 'react-router-dom';


function OrderItem(props) {
    const { order , menuItems, index } = props;
    var orderListString = ""

    //Here we join each element of the individual item to the menu. This is done locally to minimize network calls needed. 
    const enrichedOrderItemElements = order.menu_items.map((orderItem)  => {
        const menuItem = menuItems.find(x => x.id === orderItem.id)
        const enrichedOrderItemElement = { orderItem, menuItem };
        return enrichedOrderItemElement
    });

    //Here we build up a string that will contain what is in the order
    for (var enrichedOrderItem of enrichedOrderItemElements) {
        const name = enrichedOrderItem.menuItem.title
        const quantity = enrichedOrderItem.orderItem.quantity

        if (orderListString.length == 0) {
            orderListString = orderListString.concat(quantity, 'x ', name)
        } 
        else {
            orderListString = orderListString.concat(', ', quantity, 'x ', name)
        }

    }

    console.log('MerchantOrderInput: enrichedOrderItemElements', enrichedOrderItemElements)
    console.log('MerchantOrderInput: orderListString', orderListString) 

    const Div = styled('div')(({ theme }) => ({
        ...theme.typography.caption,
        padding: theme.spacing(1),
      }));

    const backgroundColor = index % 2 === 1 ? '#D3D3D3' :'';
    const hoverColour = index % 2 === 1 ? 'primary.main':'primary.main';




    //Leaving this ugly for now - all of the core functionality is here
    return (
    <Link to ={`order/${order.id}`}>
      <Box    
      sx={{
        width: 500,
        backgroundColor: backgroundColor,
        '&:hover': {
          backgroundColor: hoverColour,
          opacity: [0.9, 0.8, 0.7],
        },
      }}
      >
          <Grid container spacing = {2}> 
          <Grid item xs = {2}>
              <Box sx={{
                  width:30,
                  height:30,
                  borderRadius:'25%',
                  backgroundColor:'primary.dark'
              }}> {index + 1} </Box> 
          </Grid>

           <Grid item xs={8}>
          <h2> Order </h2>
          <Div>{orderListString}</Div>
          </Grid>

          <Grid item xs={2}>
              <h2> {order.created_at.slice(-15, -10)}</h2>
          </Grid>
          
          </Grid>
          
      </Box>
      </Link> 

    );
  }
  
  export default OrderItem;
  