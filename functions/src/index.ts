//import libraries
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import * as express from 'express';
import * as bodyParser from "body-parser";

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

interface User {
    firstName: String,
    lastName: String,
}

// Create new user
app.post('/users', async (req, res) => {
    try {
        const user: User = {
            firstName: req.body['firstName'],
            lastName: req.body['lastName'],
        }
        const newDoc = await db.collection('users').add(user);
        res.status(201).send(`Created a new user: ${newDoc.id}`);
    } catch (error) {
        res.status(400).send(`User should cointain firstName, lastName!!!`)
    }
});