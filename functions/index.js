const functions = require("firebase-functions");
const admin = require('firebase-admin');
admin.initializeApp();

var uuid = require('uuid');

function generateOrderDetails(merchantId, deviceId, menuItems) {
    return {
        merchantId: merchantId,
        status: "PENDING",
        menuItems: menuItems,
        deviceId: deviceId,
        createdAt: new Date().toISOString(),
        receiptSent: false,
    }
}


exports.createOrder = functions.https.onCall((data, context) => {
    // todo validate data
   var orderDetails = generateOrderDetails(data.merchantId, data.deviceId, data.menuItems);
   let userId = uuid.v4();
   admin.firestore().collection('Order').doc(userId).set(orderDetails);
   orderDetails['orderId'] = userId;
   return orderDetails;
});
