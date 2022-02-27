import React, { useState, useEffect } from "react";
import * as FirestoreService from "../../utils/services/FirestoreOrders";
import * as FirestoreAuth from "../../utils/services/FirestoreAuth";
import MerchantLogin from "./authentication/Login";
import EditList from "./scenes/EditList/EditList";
import {
  getAuth,
  onAuthStateChanged,
  setPersistence,
  inMemoryPersistence,
} from "firebase/auth";

function MerchantDashboard() {
  const [merchantId, setMerchantId] = useState("");
  const [userId, setUserId] = useState("");
  const [user, setUser] = useState("");

  const auth = getAuth();
  setPersistence(auth, inMemoryPersistence);

  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserId(user.uid);
        console.log("Logged in", user.email);
      } else {
        console.log("no user");
      }
    });
  }, []);

  //  render a scene based on the current state
  if (userId) {
    // Display the order list
    return <div>Here</div>;
  }
  return (
    // Display the logon screen
    <div>
      <MerchantLogin></MerchantLogin>
    </div>
  );
}

export default MerchantDashboard;
