import { Route, Routes } from "react-router-dom";
import Secure from "./secure/Secure";
import Merchant from "./merchant/Merchant";
import RedirectPageMercado from "./RedirectPageMercado";
import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../../../utils/FirebaseUtils";
import { onSnapshot } from "firebase/firestore";
import Collection from "../../../enums/Collection";
import { Colors } from "../../../components/CircleButton";
import LoadingPage from "../../../components/LoadingPage";

export default function EventsApp() {
  const [authUser, setAuthUser] = useState(null)
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [hasRetrievedAuthUser, setHasRetrievedAuthUser] = useState(false)

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, authUser => {
      console.log(authUser)
      setAuthUser(authUser)
      setHasRetrievedAuthUser(true)
    })

    return unsub
  }, [])

  useEffect(() => {
    let unsub

    if (!hasRetrievedAuthUser) { return }

    if (authUser) {
      console.log("subbing to user")
      const userId = authUser.uid

      console.log(userId)

      unsub = onSnapshot(Collection.USER.docRef(userId), doc => {
        const user = { id: doc.id, ...doc.data() }
        setUser(user)
        setIsLoading(false)
      })
    } else {
      setUser(null)
      setIsLoading(false)
    }

    return () => {
      if (unsub) { unsub() }
    }
  }, [authUser, hasRetrievedAuthUser])

  return isLoading ?
    <LoadingPage /> :
    <div style={{ backgroundColor: Colors.OFF_WHITE_LIGHT }}>
      <Routes>
        <Route path="s/*" element={<Secure user={user} />} />
        <Route path=":merchantId/*" element={<Merchant user={user} />} />

        <Route path="mcp-redirect" element={<RedirectPageMercado />} />
      </Routes>
    </div>
  
}