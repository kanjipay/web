import { Route, Routes } from "react-router-dom";
import Secure from "./secure/Secure";
import Merchant from "./merchant/Merchant";
import RedirectPageMercado from "./RedirectPageMercado";
import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../../../utils/FirebaseUtils";
import { onSnapshot } from "firebase/firestore";
import Collection from "../../../enums/Collection";

export default function EventsApp() {
  const [authUser, setAuthUser] = useState(auth.currentUser)
  const [user, setUser] = useState(null)

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, authUser => {
      setAuthUser(authUser)
    })

    return unsub
  }, [])

  useEffect(() => {
    let unsub

    if (authUser) {
      console.log("subbing to user")
      const userId = authUser.uid

      console.log(userId)

      unsub = onSnapshot(Collection.USER.docRef(userId), doc => {
        const user = { id: doc.id, ...doc.data() }
        setUser(user)
      })
    } else {
      setUser(null)
    }

    return () => {
      if (unsub) { unsub() }
    }
  }, [authUser])

  return <div>
    <Routes>
      <Route path="s/*" element={<Secure user={user} />} />
      <Route path=":merchantId/*" element={<Merchant user={user} />} />
      
      <Route path="mcp-redirect" element={<RedirectPageMercado />} />
    </Routes>
  </div>
  
}