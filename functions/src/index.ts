//import libraries
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import * as express from 'express';
import * as bodyParser from "body-parser";

var uuid = require('uuid');


//initialize firebase inorder to access its services
admin.initializeApp(functions.config().firebase);

//initialize express server
const app = express();
const main = express();

//add the path to receive request and set json as bodyParser to process the body 
main.use('/api/v1', app);
main.use(bodyParser.json());
main.use(bodyParser.urlencoded({ extended: false }));

//initialize the database and the collection 
const db = admin.firestore();

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

// Create new user
app.post('/order', async (req, res) => {
    try {
        const order: Order = {
            merchant_id: req.body['merchant_id'],
            device_id: req.body['device_id'],
            requested_items: req.body['requested_items']
        }
        const orderId = uuid.v4();
        await db.collection('Orders').doc(orderId).set(order);
        const reponse = {
            merchant_id: req.body['merchant_id'],
            device_id: req.body['device_id'],
            requested_items: req.body['requested_items'],
            order_id: orderId
        }
        res.status(201).json(reponse);
    } catch (error) {
        console.log(error);
        res.status(400).send(`User should cointain firstName, lastName!!!`)
    }
});