import { db } from "../utils/firebase";
import { FireStoreCollection } from "../utils/enums";
import { createLinkToken } from "../utils/linkToken";

async function paymentAttempt(req, res) {
  try {
    const {order_id} = req.body;
    console.log(order_id);
    const orderDoc = await db
      .collection(FireStoreCollection.ORDER)
      .doc(order_id)
      .get();
    const orderData = await orderDoc.data();
    console.log(orderData);
    const merchantId = orderData.merchant_id;
    const deviceId = orderData.device_id;
    const orderAmount = orderData.order_amount;
    console.log(deviceId);
    console.log(merchantId);
    console.log(orderAmount);
    const merchantDoc = await db
      .collection(FireStoreCollection.MERCHANT)
      .doc(merchantId)
      .get();
    const merchantData = await merchantDoc.data();
    console.log(merchantData);
    const paymentAttemptToken = await createLinkToken(
      merchantData.payment_name,
      merchantData.account_number,
      merchantData.sort_code,
      orderAmount,
      deviceId
    );
    return res.send(paymentAttemptToken);
  } catch (error) {
    console.log(error);
    res.status(400).send(`Server error`);
  }
}
export { paymentAttempt };
