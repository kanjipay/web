import { functions } from './firebase';

// Express API
import {main, app} from './api';

// Handler functions
import {createOrder} from './order';
import {paymentAttempt} from './paymentAttempt';


//define google cloud function name
export const webApi = functions.https.onRequest(main);

// check functions working ok
export const status = functions.https.onRequest((request, response) => {
    console.log("Healthcheck");
    response.send("ok");
 });

// Create new order
app.post('/orders', async (req, res) => {
    createOrder(req, res)
});

// Create new Plaid link-token for a payment attempt
app.post('/payment-attempts', async (req, res) => {
    paymentAttempt(req, res) 
});

