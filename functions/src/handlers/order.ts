var uuid = require("uuid");

import { db } from "../utils/firebase";
import { FireStoreCollection } from "../utils/enums";


async function getAmount(requestedItems, merchantId) {
  let totalPriceGBP = 0;
  for (var i = 0; i < requestedItems.length; i++) {
    let itemDoc = await db
      .collection(FireStoreCollection.MENU_ITEM)
      .doc(requestedItems[i]["id"])
      .get();
    let itemPrice = await itemDoc.data()["price"];
    totalPriceGBP += itemPrice / 100;
  }
  return totalPriceGBP;
}

async function createOrder(req, res) {
  try {
    const { merchant_id, device_id, requested_items } = req.body
    const orderId = uuid.v4();
    // todo add back in all Matt's validation
    const orderAmount = await getAmount(
      requested_items,
      merchant_id
    );
    let orderData = {
      merchant_id: merchant_id,
      device_id: device_id,
      requested_items: requested_items,
      order_amount: orderAmount,
      status: "PENDING",
      order_id: orderId,
    };
    await db.collection(FireStoreCollection.ORDER).doc(orderId).set(orderData);
    console.log("response");
    console.log(orderData);
    res.status(201).json(orderData);
    // todo add back in orderNumber and orderReference

  } catch (error) {
    console.log(error);
    res.status(300).send(`Invalid Order object`);
  }
}

export { createOrder };
