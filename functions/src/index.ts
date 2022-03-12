//import libraries
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import * as express from 'express';
import * as bodyParser from "body-parser";
import * as cors from 'cors';
import * as plaid from 'plaid';


var uuid = require('uuid');


//initialize firebase inorder to access its services
admin.initializeApp(functions.config().firebase);

//initialize express server
const app = express();
const main = express();
const corsInstance = cors({ origin: "*"});
//"https://mercadopay-dev.web.app"
main.use(corsInstance);
main.options('*', corsInstance); // Think this is needed for preflight requests

//add the path to receive request and set json as bodyParser to process the body 
main.use('/v1', app);
main.use(bodyParser.json());
main.use(bodyParser.urlencoded({ extended: false }));

//initialise the database and the collection 
const db = admin.firestore();

//initalise the Plaid client
const plaidConfiguration = new plaid.Configuration({
    basePath: plaid.PlaidEnvironments.sandbox,
    baseOptions: {
      headers: {
        'PLAID-CLIENT-ID': process.env.PLAID_CLIENT_ID,
        'PLAID-SECRET': process.env.PLAID_SECRET,
      },
    },
  })

const plaidClient = new plaid.PlaidApi(plaidConfiguration);  

//define google cloud function name
export const webApi = functions.https.onRequest(main);

interface Item {
    id: String, 
    quantity: Number,
    title: String
}

interface Order {
    merchant_id: String,
    device_id: String,
    requested_items: Array<Item>
}


export const status = functions.https.onRequest((request, response) => {
    console.log("Healthcheck", {structuredData: true});
    response.send("ok");
 });

// Create new order
app.post('/orders', async (req, res) => {
    try {
        const order: Order = {
            merchant_id: req.body['merchant_id'],
            device_id: req.body['device_id'],
            requested_items: req.body['requested_items']
        }
        console.log(order);
        const orderId = uuid.v4();
        await db.collection('Order').doc(orderId).set(order);
        const reponseBody = {
            merchant_id: req.body['merchant_id'],
            device_id: req.body['device_id'],
            requested_items: req.body['requested_items'],
            order_id: orderId,
            status:"PENDING",
        }
        console.log('response');
        console.log(reponseBody);
        res.status(201).json(reponseBody);
    } catch (error) {
        console.log(error);
        res.status(300).send(`Invalid Order object`)
    }
});

// Create new payment-attempt
app.post('/payment-attempts', async (req, res) => {
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
});

async function createLinkToken(paymentName, accountNumber, sortCode, total, deviceId) {
    const recipientBody = {
        name: paymentName,
        bacs: {
          account: accountNumber,
          sort_code: sortCode
        }
      }
    console.log(recipientBody);
    const recipientResponse = await plaidClient.paymentInitiationRecipientCreate(recipientBody)
    const recipientResponseData = await recipientResponse.data;
    const paymentCreateBody = {
        recipient_id: recipientResponseData.recipient_id,
        reference: "Mercado",
        amount: {
          value: total,
          currency: plaid.PaymentAmountCurrency.Gbp
        }
      }
    console.log(paymentCreateBody);
    const paymentResponse = await plaidClient.paymentInitiationPaymentCreate(paymentCreateBody)
    const paymentResponseData = await paymentResponse.data;
    const linkTokenBody = {
        user: {
          client_user_id: deviceId
        },
        client_name: "Mercado",
        products: [plaid.Products.PaymentInitiation],
        country_codes: [plaid.CountryCode.Gb],
        language: "en",
        webhook: "http://localhost:3000",
        payment_initiation: {
            payment_id: paymentResponseData.payment_id
        }
      }
    console.log(linkTokenBody);
    const linkResponse = await plaidClient.linkTokenCreate(linkTokenBody)
    const linkTokenData = await linkResponse.data
    console.log(linkTokenData)
    const response = await {link_token:linkTokenData.link_token, payment_attempt_id:paymentResponseData.payment_id}
    return response
}