import { collection, doc, onSnapshot, query } from "firebase/firestore";
import { db } from "../utils/FirebaseUtils";

export default class Collection {
  static MERCHANT = new Collection("Merchant");
  static MEMBERSHIP = new Collection("Membership");
  static USER = new Collection("User");
  static PRODUCT = new Collection("Product");
  static EVENT = new Collection("Event")
  static MENU_ITEM = new Collection("MenuItem");
  static MENU_SECTION = new Collection("MenuSection");
  static ORDER = new Collection("Order");
  static PAYMENT_INTENT = new Collection("PaymentIntent");
  static PAYMENT_ATTEMPT = new Collection("PaymentAttempt");
  static OPENING_HOUR_RANGE = new Collection("OpeningHourRange");
  static CONTACT_REQUEST = new Collection("ContactRequest");
  static LINK = new Collection("Link");
  static STATE = new Collection("State");

  constructor(name) {
    this.name = name;
    this.ref = collection(db, this.name);
    this.docRef = (docId) => doc(db, this.name, docId);

    this.onChange = (docId, callback) => {
      return onSnapshot(this.docRef(docId), doc => {
        if (doc.exists) {
          callback({ id: doc.id, ...doc.data() })
        } else {
          callback(null)
        }
      })
    }

    this.queryOnChange = (callback, ...queryConstraints) => {
      const q = query(
        this.ref,
        ...queryConstraints
      )

      return onSnapshot(q, snapshot => {
        const docs = snapshot.docs.map(doc => {
          return { id: doc.id, ...doc.data() }
        })

        callback(docs)
      })
    }

    this.queryOnChangeGetOne = (callback, ...queryConstraints) => {
      return this.queryOnChange(docs => {
        docs.length === 0 ? callback(null) : callback(docs[0])
      }, ...queryConstraints)
    }
  }
}
