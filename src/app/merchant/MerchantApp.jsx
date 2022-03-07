import React, { useState, useEffect } from "react";
import { Route, Routes, useParams } from "react-router-dom";
import MerchantLogin from "./scenes/login/MerchantLoginPage";
import MerchantOrderPage from "./scenes/order/MerchantOrderPage"
import {
  getAuth,
  onAuthStateChanged,
  setPersistence,
  inMemoryPersistence,
} from "firebase/auth";
import { collection, doc, onSnapshot, query, where, getDocs, getDoc } from "firebase/firestore";
import { db } from "../../utils/FirebaseUtils"
import MerchantOrderList from "./scenes/orderlist/MerchantOrderListPage";
import LoadingPage from "../../components/LoadingPage";


function MerchantApp() {
  const [merchantId, setMerchantId] = useState("");
  const [merchantRef, setMerchantRef] = useState("");
  const [userId, setUserId] = useState("");
  const [orderList, setOrderList] = useState("");
  const [menuItems, setMenuItems] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false); 

  //TODO: Check whether this handling of authentication is actually secure! We may need to have permissions for the various apps and/or build a backend auth system for security. 


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
        setIsAuthenticated(true)
        console.log('User authenticated')
        console.log("Account", user.email, "currently authenticated");
        console.log("Account", userId, "currently authenticated");
        //TODO query firestore to retreive merchant ID associated with this user account
      } else {
        console.log("No user currently authenticated");
        setMerchantId(null)
        setMerchantRef(null)
        setIsAuthenticated(false)
      }
    });
  }, [userId, auth]);


  // Link user account to merchant account
  useEffect(() => {

      if (userId) {
        const MerchantIdQuery = query(collection(db, "Merchant"), where("user_id", "==", userId))


        onSnapshot(MerchantIdQuery, snapshot => {
      const data = snapshot.docs.map((doc) => {
        const range = { id: doc.id, ...doc.data() };
        delete range.merchant;

        return range;
      });
      setMerchantId(data[0].id)
      })

   }

},[userId, merchantId]);


//Retreives merchantID 
useEffect(() => {

    if (merchantId) {
        const merchantRef = doc(db, "Merchant", merchantId);

        setMerchantRef(merchantRef)

    }
    },[merchantId]);


useEffect(() => {

    const orderQuery = query(collection(db, "Order"),where("status", "==", "PAID"),where("merchant_id", "==", merchantId));


    const ordersUbsub = onSnapshot(orderQuery, (orderSnapshot) => {
        const items = orderSnapshot.docs.map((doc) => {
            const item = { id: doc.id, ...doc.data() };
            return item;

    });
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
  
        console.log('menuItemUbsub: Merchants Items', items)
        setMenuItems(items)
      });



      // TODO create component for each Order item 
      return () => {
        menuItemUnsub();
        ordersUbsub()
      };
    }, [merchantRef]);


    const isLoadedAndAuthenticated = userId && (orderList.length > 0) && (menuItems.length > 0) && isAuthenticated

  
  //  render a scene based on the current state
  if (isLoadedAndAuthenticated) {
    // Load the routes for the merchant component
    // TODO improve the loading experience here


    return (<Routes>
        <Route path="order/:orderId" element={<MerchantOrderPage orderList = {orderList} menuItems = {menuItems}>  </MerchantOrderPage>} />
        <Route path="*" element={<MerchantOrderList {...{ orderList, menuItems }}></MerchantOrderList>} />
    </Routes>

    )

  }
  else if (isAuthenticated) {
      return <div>
          <LoadingPage />
      </div>
  }
  return (
    // Display the logon screen
    <div>
      <MerchantLogin></MerchantLogin>
    </div>

    
  );
}

export default MerchantApp;
