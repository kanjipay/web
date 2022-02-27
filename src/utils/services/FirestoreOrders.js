import {
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
import { db } from "../FirebaseUtils";

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
