import React, { useState, useEffect } from "react";
import MerchantLogin from "./authentication/Login";
import {
  getAuth,
  onAuthStateChanged,
  setPersistence,
  inMemoryPersistence,
} from "firebase/auth";

function MerchantDashboard() {
  //   const [merchantId, setMerchantId] = useState("");
  const [userId, setUserId] = useState("");

  const auth = getAuth();

  // This is only present for local testing as it makes it easy to retrigger the authentication flow. 
  //In reality we should use device persistance as merchants will not want to always log back on (perhaps make this customizable?)
  setPersistence(auth, inMemoryPersistence);

  // TODO  this will cause a memory leak as we need to unsubscribe from listening when component is unmounted
  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserId(user.uid);
        console.log("Account", user.email, "currently authenticated");
        //TODO query firestore to retreive merchant ID associated with this user account
      } else {
        console.log("No user currently authenticated");
      }
    });
  }, []);

  //  render a scene based on the current state
  if (userId) {
    // TODO add headers that allow us to toggle between merchant shop configuration and the live stream of orders
    // TODO add those components
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
