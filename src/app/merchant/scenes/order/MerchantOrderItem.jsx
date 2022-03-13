import Grid from "@mui/material/Grid";
import { formatCurrency } from "../../../../utils/helpers/money";
import Spacer from "../../../../components/Spacer";

function MerchantOrderItem(props) {
  const { quantity, name, price } = props;

  const totalPrice = price * quantity;

  return (
    <Grid container spacing={2}>
      <Grid item xs={2}>
        <div>{quantity}</div>
      </Grid>
      <Grid item xs={8}>
        <div>{name}</div>
      </Grid>
      <Grid item xs={2}>
        <div>{formatCurrency(totalPrice)}</div>
      </Grid>
      <Spacer y={2} />
    </Grid>
  );
}

export default MerchantOrderItem;
