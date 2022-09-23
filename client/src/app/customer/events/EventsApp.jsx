import { Route, Routes } from "react-router-dom"
import Secure from "./secure/Secure"
import Merchant from "./merchant/Merchant"
import { useEffect, useState } from "react"
import { onAuthStateChanged } from "firebase/auth"
import { auth } from "../../../utils/FirebaseUtils"
import Collection from "../../../enums/Collection"
import { Colors } from "../../../enums/Colors"
import LoadingPage from "../../../components/LoadingPage"
import ArtistPage from "../ArtistPage"

export default function EventsApp() {
  const [authUser, setAuthUser] = useState(null)
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [hasRetrievedAuthUser, setHasRetrievedAuthUser] = useState(false)

  useEffect(() => {
    return onAuthStateChanged(auth, (authUser) => {
      setAuthUser(authUser)
      setHasRetrievedAuthUser(true)
    })
  }, [])

  useEffect(() => {
    if (!hasRetrievedAuthUser) {
      return
    }

    if (authUser) {
      const userId = authUser.uid

      return Collection.USER.onChange(userId, (user) => {
        setUser(user)
        setIsLoading(false)
      })
    } else {
      setUser(null)
      setIsLoading(false)
    }
  }, [authUser, hasRetrievedAuthUser])

  return isLoading ? (
    <LoadingPage />
  ) : (
    <div style={{ backgroundColor: Colors.OFF_WHITE_LIGHT }}>
      <Routes>
        <Route path="s/*" element={<Secure user={user} />} />
        <Route path="artists/:artistId" element={<ArtistPage />} />
        <Route path=":merchantId/*" element={<Merchant user={user} />} />
      </Routes>
    </div>
  )
}
