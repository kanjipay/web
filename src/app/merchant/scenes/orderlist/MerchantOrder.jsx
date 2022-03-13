import Box from '@mui/material/Box';
import { styled } from '@mui/material/styles';
import Grid from '@mui/material/Grid';
import { Link } from 'react-router-dom';
import AlertIcon from '../../../../components/AlertIcon';
import Paper from '@mui/material/Paper';
import { getTimeFromUnixTimestamp } from '../../../../utils/helpers/time';

function OrderItem(props) {
    const { order , menuItems, index } = props;
    var orderListString = ""
    const orderTime = getTimeFromUnixTimestamp(order.created_at)

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
    console.log('')

    const Div = styled('div')(({ theme }) => ({
        ...theme.typography.caption,
        padding: theme.spacing(1),
      }));

    const backgroundColor = index % 2 === 1 ? '#D3D3D3' :'';
    const hoverColour = index % 2 === 1 ? 'primary.main':'primary.main';

    const Item = styled(Paper)(({ theme }) => ({
        backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
        ...theme.typography.body2,
        padding: theme.spacing(1),
        textAlign: 'center',
        color: theme.palette.text.secondary,
      }));


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


           <Box sx={{ width: 1 }}>
      <Box display="grid" gridTemplateColumns="repeat(12, 1fr)" gap={2}>
        <Box gridColumn="span 4">
        <h2 className='header-s'>Order</h2>
        </Box>
        <Box gridColumn="span 8">
        <AlertIcon />
        </Box>
        <Box gridColumn="span 12">
        <div className='text-body-faded'>{orderListString}</div>
        </Box>
      </Box>
      </Box>


      </Grid>

      <Grid item xs={2}>
      <h2> {orderTime}</h2>
      </Grid>

      </Grid>




          {/* <h2> Order</h2> 
          <AlertIcon />
          <Div>{orderListString}</Div>
          </Grid>

          <Grid item xs={2}>
              <h2> {order.created_at}</h2>
          </Grid>
          
          </Grid> */}
          
      </Box>
      </Link> 

    );
  }
  
  export default OrderItem;
  