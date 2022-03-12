var uuid = require("uuid");

import { db } from "../utils/firebase";
import { FireStoreCollection } from "../utils/enums";

interface Item {
  id: String;
  quantity: Number;
  title: String;
}

interface Order {
  merchant_id: String;
  device_id: String;
  requested_items: Array<Item>;
}

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
    const order: Order = {
      merchant_id: req.body["merchant_id"],
      device_id: req.body["device_id"],
      requested_items: req.body["requested_items"],
    };
    console.log(order);
    const orderId = uuid.v4();
    // todo add back in all Matt's validation
    const orderAmount = await getAmount(
      order.requested_items,
      order.merchant_id
    );
    let orderData = {
      merchant_id: req.body["merchant_id"],
      device_id: req.body["device_id"],
      requested_items: req.body["requested_items"],
      order_amount: orderAmount,
      status: "PENDING",
      order_id: orderId,
    };
    await db.collection(FireStoreCollection.ORDER).doc(orderId).set(orderData);
    console.log("response");
    console.log(orderData);
    res.status(201).json(orderData);
  } catch (error) {
    console.log(error);
    res.status(300).send(`Invalid Order object`);
  }
}

export { createOrder };
