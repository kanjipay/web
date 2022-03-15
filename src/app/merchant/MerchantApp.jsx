import React, { useState, useEffect } from "react";
import { Route, Routes } from "react-router-dom";
import MerchantLogin from "./scenes/login/MerchantLoginPage";
import MerchantOrderPage from "./scenes/order/MerchantOrderPage";
import {
  getAuth,
  onAuthStateChanged,
  // setPersistence,
  // inMemoryPersistence,
} from "firebase/auth";
import {
  collection,
  doc,
  onSnapshot,
  query,
  where,
  // getDocs,
  // getDoc,
  orderBy,
} from "firebase/firestore";
import { db } from "../../utils/FirebaseUtils";
import MerchantOrderList from "./scenes/orderlist/MerchantOrderListPage";
import LoadingPage from "../../components/LoadingPage";
import MerchantConfigurePage from "./scenes/configure/MerchantConfigurePage";
import MerchantAccountPage from "./scenes/account/MerchantAccountPage";
// import { getWeekdays } from "../../utils/helpers/time";
import MenuItemConfigPage from "./scenes/configure/MenuItemConfigPage";

function MerchantApp() {
  const [merchantId, setMerchantId] = useState("");
  // eslint-disable-next-line no-unused-vars
  const [merchantRef, setMerchantRef] = useState("");
  const [merchantData, setMerchantData] = useState("");
  const [userId, setUserId] = useState("");
  const [orderList, setOrderList] = useState("");
  const [menuItems, setMenuItems] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [merchantMenuSections, setMerchantMenuSections] = useState("");
  const [openingHours, setOpeningHours] = useState("");

  //TODO: Check whether this handling of authentication is actually secure! We may need to have permissions for the various apps and/or build a backend auth system for security.

  const auth = getAuth();

  // This is only present for local testing as it makes it easy to retrigger the authentication flow.
  //In reality we should use device persistance as merchants will not want to always log back on (perhaps make this customizable?)
  //   setPersistence(auth, inMemoryPersistence);

  // TODO  this will cause a memory leak as we need to unsubscribe from listening when component is unmounted

  // When user authenticates
  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserId(user.uid);
        setIsAuthenticated(true);
        console.log("User authenticated");
        console.log("Account", user.email, "currently authenticated");
        console.log("Account", userId, "currently authenticated");
        //TODO query firestore to retreive merchant ID associated with this user account
      } else {
        console.log("No user currently authenticated");
        setMerchantId(null);
        setMerchantRef(null);
        setIsAuthenticated(false);
      }
    });
  }, [userId, auth]);

  // Link user account to merchant account
  useEffect(() => {
    if (userId) {
      const MerchantQuery = query(
        collection(db, "Merchant"),
        where("user_id", "==", userId)
      );

      onSnapshot(MerchantQuery, (snapshot) => {
        const data = snapshot.docs.map((doc) => {
          const range = { id: doc.id, ...doc.data() };
          delete range.merchant;

          return range;
        });
        setMerchantId(data[0].id);
        setMerchantData(data);
      });
    }
  }, [userId, merchantId]);

  //Retreives merchantID
  useEffect(() => {
    if (merchantId) {
      const merchantRef = doc(db, "Merchant", merchantId);

      setMerchantRef(merchantRef);
    }
  }, [merchantId]);

  useEffect(() => {
    const orderQuery = query(
      collection(db, "Order"),
      where("status", "==", "PAID"),
      where("merchant_id", "==", merchantId),
      orderBy("created_at")
    );

    const ordersUbsub = onSnapshot(orderQuery, (orderSnapshot) => {
      const items = orderSnapshot.docs.map((doc) => {
        const item = { id: doc.id, ...doc.data() };
        return item;
      });
      setOrderList(items);
    });

    const menuItemQuery = query(
      collection(db, "MenuItem"),
      where("merchant_id", "==", merchantId)
    );

    const menuItemUnsub = onSnapshot(menuItemQuery, (itemSnapshot) => {
      const items = itemSnapshot.docs.map((document) => {
        const menuItemRef = doc(db, "MenuItem", document.id);
        const item = { id: document.id, ref: menuItemRef, ...document.data() };
        return item;
      });

      setMenuItems(items);
    });

    return () => {
      menuItemUnsub();
      ordersUbsub();
    };
  }, [merchantId]);

  // TODO understand why this query works here in a seperate useEffect but not in the previous useEffect
  useEffect(() => {
    const menuSectionQuery = query(
      collection(db, "MenuSection"),
      where("merchant_id", "==", merchantId)
    );
    const menuSectionUnsub = onSnapshot(menuSectionQuery, (sectionSnapshot) => {
      const sections = sectionSnapshot.docs.map((document) => {
        const section = { id: document.id, ...document.data() };
        return section;
      });
      setMerchantMenuSections(sections);
    });

    const openingHoursQuery = query(
      collection(db, "OpeningHourRange"),
      where("merchant_id", "==", merchantId)
    );
    const openingHoursUnsub = onSnapshot(
      openingHoursQuery,
      (openHoursSnapshot) => {
        const hours = openHoursSnapshot.docs.map((document) => {
          const hours = { id: document.id, ...document.data() };
          return hours;
        });
        setOpeningHours(hours);
      }
    );

    return () => {
      menuSectionUnsub();
      openingHoursUnsub();
    };
  }, [merchantId]);

  const isLoadedAndAuthenticated =
    userId &&
    menuItems.length > 0 &&
    merchantMenuSections.length > 0 &&
    isAuthenticated;

  //  render a scene based on the current state
  if (isLoadedAndAuthenticated) {
    // Load the routes for the merchant component
    // TODO improve the loading experience here

    return (
      <Routes>
        <Route
          path="order/:orderId"
          element={
            <MerchantOrderPage orderList={orderList} menuItems={menuItems}>
              {" "}
            </MerchantOrderPage>
          }
        />
        <Route
          path="configure/item/:menuItemId"
          element={
            <MenuItemConfigPage
              menuItems={menuItems}
              menuSections={merchantMenuSections}
            >
              {" "}
            </MenuItemConfigPage>
          }
        />
        <Route
          path="configure"
          element={
            <MerchantConfigurePage
              merchantData={merchantData}
              menuItems={menuItems}
              menuSections={merchantMenuSections}
            />
          }
        />
        <Route
          path="account"
          element={
            <MerchantAccountPage
              merchantData={merchantData[0]}
              openingHours={openingHours}
            />
          }
        />
        <Route
          path="*"
          element={
            <MerchantOrderList
              {...{ orderList, menuItems }}
            ></MerchantOrderList>
          }
        />
      </Routes>
    );
  } else if (isAuthenticated) {
    return (
      <div>
        <LoadingPage />
      </div>
    );
  }
  return (
    // Display the logon screen
    <div>
      <MerchantLogin></MerchantLogin>
    </div>
  );
}

export default MerchantApp;
