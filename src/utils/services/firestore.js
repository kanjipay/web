import { initializeApp } from "firebase/app";
import {
  getFirestore,
  query,
  orderBy,
  onSnapshot,
  collection,
  getDoc,
  getDocs,
  addDoc,
  doc,
  serverTimestamp,
} from "firebase/firestore";
// import { getAuth, signInAnonymously } from "firebase/auth";

const app = initializeApp({
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID,
});
const db = getFirestore(app);

export const createOrderList = (userName, userId) => {
  const orderColRef = collection(db, "orderLists");
  return addDoc(orderColRef, {
    created: serverTimestamp(),
    createdBy: userId,
    users: [
      {
        userId: userId,
        name: userName,
      },
    ],
  });
};

export const streamOrderListItems = (orderListId, snapshot, error) => {
  const itemsColRef = collection(db, "orderLists", orderListId, "items");
  const itemsQuery = query(itemsColRef, orderBy("created"));
  return onSnapshot(itemsQuery, snapshot, error);
};

export const getOrderList = (orderListId) => {
  const orderDocRef = doc(db, "orderLists", orderListId);
  return getDoc(orderDocRef);
};

export const getOrderListItems = (orderListId) => {
  const itemsColRef = collection(db, "orderLists", orderListId, "items");
  return getDocs(itemsColRef);
};

export const addOrderListItem = (item, orderListId, userId) => {
  return getOrderListItems(orderListId)
    .then((querySnapshot) => querySnapshot.docs)
    .then((orderListItems) =>
      orderListItems.find(
        (orderListItem) =>
          orderListItem.data().name.toLowerCase() === item.toLowerCase()
      )
    )
    .then((matchingItem) => {
      if (!matchingItem) {
        const itemsColRef = collection(db, "orderLists", orderListId, "items");
        return addDoc(itemsColRef, {
          name: item,
          created: serverTimestamp(),
          createdBy: userId,
        });
      }
      throw new Error("duplicate-item-error");
    });
};

export default db;
