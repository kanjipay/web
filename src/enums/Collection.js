import { collection, doc } from "firebase/firestore";
import { db } from "../utils/FirebaseUtils";

export default class Collection {
  static MERCHANT = new Collection("Merchant");
  static MENU_ITEM = new Collection("MenuItem");
  static MENU_SECTION = new Collection("MenuSection");
  static ORDER = new Collection("Order");
  static PAYMENT_ATTEMPT = new Collection("PaymentAttempt");
  static OPENING_HOUR_RANGE = new Collection("OpeningHourRange");

  constructor(name) {
    this.name = name;
    this.ref = collection(db, this.name);
    this.docRef = (docId) => doc(db, this.name, docId);
  }
}
