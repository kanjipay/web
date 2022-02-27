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
import { getAuth, signInAnonymously } from "firebase/auth";

const app = initializeApp({
  apiKey: "AIzaSyD_mPx2fE-VuAtVK01xI4tDGaZTAX7ErvQ",
  authDomain: "mercadopay.firebaseapp.com",
  projectId: "mercadopay",
  storageBucket: "mercadopay.appspot.com",
  messagingSenderId: "318216209877",
  appId: "1:318216209877:web:d974381faf6ce9946be95c",
  measurementId: "G-41M1VDVV2M",
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
