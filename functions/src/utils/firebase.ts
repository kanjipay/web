//import libraries
import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

//initialize firebase inorder to access its services
//todo configure with env vars
admin.initializeApp(functions.config().firebase);
//initialise the database and the collection
const db = admin.firestore();

export { db, functions };
