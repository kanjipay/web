import { getAuth, onAuthStateChanged } from "firebase/auth";
import { useEffect, useState } from "react";
import { Route, Routes } from "react-router-dom";
import { auth } from "../../utils/FirebaseUtils";

export default function Dashboard() {
  const [user, setUser] = useState(null)

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, user => {
      setUser(user)
    })

    return unsub
  })
  return <Routes>
    <Route path="events" element={<></>} />
  </Routes>
}