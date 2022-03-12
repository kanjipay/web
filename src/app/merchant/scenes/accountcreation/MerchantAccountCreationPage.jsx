import React, { useState, useEffect } from "react";
import MerchantLogin from "./authentication/Login";
import {
  getAuth,
  onAuthStateChanged,
  setPersistence,
  inMemoryPersistence,
} from "firebase/auth";
import { collection, doc, onSnapshot, query, where, getDocs, getDoc } from "firebase/firestore";
import { db } from "../../utils/FirebaseUtils"
import MerchantDashboardItemList from "./scenes/EditList/ItemList/MerchantDashboardItemList";
import { FormControlUnstyledContext } from "@mui/base";


function MerchantDashboard() {
  const [merchantId, setMerchantId] = useState("");
  const [merchantRef, setMerchantRef] = useState("");
  const [userId, setUserId] = useState("");
  const [merchantData, setMerchantData] = useState("");
  const [orderList, setOrderList] = useState("");
  const [menuItems, setMenuItems] = useState("");


  const auth = getAuth();

  // This is only present for local testing as it makes it easy to retrigger the authentication flow. 
  //In reality we should use device persistance as merchants will not want to always log back on (perhaps make this customizable?)
  setPersistence(auth, inMemoryPersistence);

  // TODO  this will cause a memory leak as we need to unsubscribe from listening when component is unmounted

  // When user authenticates
  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserId(user.uid);
        console.log('User authenticated')
        console.log("Account", user.email, "currently authenticated");
        console.log("Account", userId, "currently authenticated");
        //TODO query firestore to retreive merchant ID associated with this user account
      } else {
        console.log("No user currently authenticated");
        setMerchantId(null)
        setMerchantRef(null)
      }
    });
  }, [userId, auth]);


  // Link user account to merchant account
  useEffect(() => {
      console.log('Merchant ID Query Running')

      if (userId) {
        console.log('Right before query', userId)
        const MerchantIdQuery = query(collection(db, "Merchant"), where("user_id", "==", userId))


        onSnapshot(MerchantIdQuery, snapshot => {
      const data = snapshot.docs.map((doc) => {
        const range = { id: doc.id, ...doc.data() };
        delete range.merchant;

        return range;
      });
      console.log('Merchant ID found:', merchantId)
      setMerchantId(data[0].id)
      setMerchantData(data[0])
      })

   }

},[userId, merchantId]);


//Retreives merchantID 
useEffect(() => {
    console.log('Merchant Queries Running')

    if (merchantId) {
        const merchantRef = doc(db, "Merchant", merchantId);

        console.log('MerchantRef', merchantRef)

        setMerchantRef(merchantRef)

    }
    },[merchantId]);


useEffect(() => {

    const orderQuery = query(collection(db, "Order"),where("status", "==", "PAID"),where("merchant", "==", merchantRef));


    const ordersUbsub = onSnapshot(orderQuery, (orderSnapshot) => {
        const items = orderSnapshot.docs.map((doc) => {
            const item = { id: doc.id, ...doc.data() };
            console.log(doc)
            return item;

    });
    console.log('Merchants Orders', items)
    setOrderList(items)
});
 


    const menuItemQuery = query(
        collection(db, "MenuItem"),
        where("merchant", "==", merchantRef)
      );


    const menuItemUnsub = onSnapshot(menuItemQuery, (itemSnapshot) => {
        const items = itemSnapshot.docs.map((document) => {
          const menuItemRef = doc(db, "MenuItem", document.id);
          const item = { id: document.id, ref: menuItemRef,...document.data() };
          item.merchantId = item.merchant.id;
          item.sectionId = item.section.id;
  
          delete item.merchant;
          delete item.section;
  
          return item;
        });
  
        console.log('Merchants Items', items)
        setMenuItems(items)
      });



      // TODO create component for each Order item 
      return () => {
        menuItemUnsub();
        ordersUbsub()
      };
    }, [merchantRef]);



  
  //  render a scene based on the current state
  if (userId && orderList && menuItems) {
    // TODO add headers that allow us to toggle between merchant shop configuration and the live stream of orders
    // TODO add those components
    return <MerchantDashboardItemList {...{ orderList, menuItems }}></MerchantDashboardItemList>;;
  }
  else if (userId) {
      return <div>
          Loading Screen
      </div>
  }
  return (
    // Display the logon screen
    <div>
      <MerchantLogin></MerchantLogin>
    </div>
  );
}

export default MerchantDashboard;
