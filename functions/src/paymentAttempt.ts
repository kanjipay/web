import {db} from './firebase';

import { createLinkToken } from './linkToken';

async function paymentAttempt(req, res) {
    try {
        const orderId = req.body['order_id'];
        console.log(orderId);
        const orderDoc = await db.collection('Order').doc(orderId).get()
        const docData = orderDoc.data();
        console.log(docData);
        const merchantId = docData.merchant_id;
        const deviceId = docData.device_id;
        console.log(deviceId);
        console.log(merchantId);
        const merchantDoc = await db.collection('Merchant').doc(merchantId).get()
        const merchantData = await merchantDoc.data();
        console.log(merchantData);
        const paymentAttemptToken = await createLinkToken(merchantData.payment_name,
                                                    merchantData.account_number,
                                                    merchantData.sort_code,
                                                    2,
                                                    deviceId);
        return res.send(paymentAttemptToken);
    } catch (error) {
        console.log(error);
        res.status(400).send(`Server error`)
    }
}
export {paymentAttempt}