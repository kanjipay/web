import React, { useState, useEffect } from "react";
import { Route, Routes } from "react-router-dom";
import MerchantLogin from "./scenes/login/MerchantLoginPage";
import MerchantOrderPage from "./scenes/order/MerchantOrderPage";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import MerchantOrderList from "./scenes/orderlist/MerchantOrderListPage";
import LoadingPage from "../../components/LoadingPage";
import MerchantConfigurePage from "./scenes/configure/MerchantConfigurePage";
import MerchantAccountPage from "./scenes/account/MerchantAccountPage";
import MenuItemConfigPage from "./scenes/configure/MenuItemConfigPage";
import MerchantForgotPasswordPage from "./scenes/login/MerchantForgotPasswordPage";
import { setPersistence, inMemoryPersistence } from "firebase/auth";
import {
  fetchMerchantByUserId,
  fetchMerchantOrders,
} from "../../utils/services/MerchantService";
import {
  fetchMenuItems,
  fetchMenuSections,
  fetchOpeningHours,
} from "../../utils/services/MenuService";

function MerchantApp() {
  const [merchantId, setMerchantId] = useState("");
  const [merchantData, setMerchantData] = useState("");
  const [userId, setUserId] = useState("");
  const [orderList, setOrderList] = useState("");
  const [menuItems, setMenuItems] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [merchantMenuSections, setMerchantMenuSections] = useState("");
  const [openingHours, setOpeningHours] = useState("");

  // TODO - move auth functions to Auth Service? Don't know if we need this
  const auth = getAuth();
  setPersistence(auth, inMemoryPersistence);

  useEffect(() => {
    // When user becomes logged in/out, update local variables
    const authUnsub = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserId(user.uid);
        setIsAuthenticated(true);
        console.log("User authenticated");
      } else {
        console.log("No user currently authenticated");
        setMerchantId(null);
        setIsAuthenticated(false);
      }
    });

    // Link user account to merchant account
    const merchantUnsub = fetchMerchantByUserId(userId, (snapshot) => {
      if (snapshot.docs.length > 0) {
        const doc = snapshot.docs[0];
        setMerchantData({ id: doc.id, ...doc.data() });
        setMerchantId(doc.id);
      }
    });

    //Fetch Orders
    const orderUnsub = fetchMerchantOrders(merchantId, (snapshot) => {
      if (snapshot) {
        const items = snapshot.docs.map((doc) => {
          return { id: doc.id, ...doc.data() };
        });
        setOrderList(items);
      }
    });

    //Fetch Menu Items
    const menuItemUnsub = fetchMenuItems(merchantId, (snapshot) => {
      if (snapshot) {
        const items = snapshot.docs.map((doc) => {
          return { id: doc.id, ...doc.data() };
        });
        setMenuItems(items);
      }
    });

    //Fetch Menu Sections
    const menuSectionUnsub = fetchMenuSections(merchantId, (snapshot) => {
      if (snapshot) {
        const items = snapshot.docs.map((doc) => {
          return { id: doc.id, ...doc.data() };
        });
        setMerchantMenuSections(items);
      }
    });

    //Fetch Opening Hours
    const openingHoursUnsub = fetchOpeningHours(merchantId, (snapshot) => {
      if (snapshot) {
        const items = snapshot.docs.map((doc) => {
          return { id: doc.id, ...doc.data() };
        });
        setOpeningHours(items);
      }
    });

    return () => {
      authUnsub();
      merchantUnsub();
      orderUnsub();
      menuItemUnsub();
      menuSectionUnsub();
      openingHoursUnsub();
    };
  }, [auth, userId, merchantId]);

  // TODO make this loading screen work at a scene level rather than for the global app - should be faster :)
  const isLoadedAndAuthenticated =
    userId &&
    menuItems.length > 0 &&
    merchantMenuSections.length > 0 &&
    openingHours.length > 0 &&
    isAuthenticated;

  //  render a scene based on the current state
  if (isLoadedAndAuthenticated) {
    // Load the routes for the merchant component
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
              merchantData={merchantData}
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
      <Routes>
        <Route
          path="forgot-password"
          element={<MerchantForgotPasswordPage />}
        />

        <Route path="*" element={<MerchantLogin />} />
      </Routes>
    </div>
  );
}

export default MerchantApp;
