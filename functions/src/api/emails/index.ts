const sendGridMail = require("@sendgrid/mail");
import { db } from "../../admin";

sendGridMail.setApiKey(process.env.SENDGRID_API_KEY);

const FROM_EMAIL = "oliver@mercadopay.co";
const TEMPLATE_ID = "d-a888fe1bc7ac4154a40f8a299cfb30fb";

// look up order details from firebase
async function getOrderDetails(orderId) {
  const orderDoc = await db.collection("Order").doc(orderId).get();
  const { merchant_id, order_number, order_items, total } = await orderDoc.data();
  const merchantDoc = await db.collection("Merchant").doc(merchant_id).get();
  const merchantName = merchantDoc.data()["display_name"];
  const results = await { merchantName, order_items, order_number, total };
  console.log("results");
  console.log(results);
  return results;
}

// Construct a data that matches our receipt Sendgrid dynamic template
function constructTemplate(
  merchantName: string,
  orderNumber: number,
  orderItems,
  total: number
) {
  console.log(orderItems);
  const orderItemClean = orderItems.map((o) => ({
    quantity: o.quantity,
    price: o.price / 100,
    text: o.title,
  }));
  console.log(orderItemClean);
  return {
    receipt: true,
    orderNumber: orderNumber,
    merchantName: merchantName,
    items: orderItemClean,
    total: total / 100,
  };
}

// Send email
function createMessage(
  toEmail: string,
  merchantName: string,
  orderNumber: number,
  orderItems: Array<Object>,
  total: number
) {
  const templateData = constructTemplate(
    merchantName,
    orderNumber,
    orderItems,
    total
  );
  return {
    to: toEmail,
    from: FROM_EMAIL,
    subject: `Order ${orderNumber}`,
    templateId: TEMPLATE_ID,
    dynamic_template_data: templateData,
  };
}

async function sendEmail(toEmail: string, orderId: string) {
  const { merchantName, order_items, order_number, total } =
    await getOrderDetails(orderId);
  const emailMessage = await createMessage(
    toEmail,
    merchantName,
    order_number,
    order_items,
    total
  );
  console.log(emailMessage);
  try {
    await sendGridMail.send(emailMessage);
    console.log("Test email sent successfully");
  } catch (error) {
    console.error("Error sending test email");
    console.error(error);
    if (error.response) {
      console.error(error.response.body);
    }
  }
}

export { sendEmail };
