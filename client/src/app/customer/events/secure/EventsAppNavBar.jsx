import { onAuthStateChanged } from "firebase/auth"
import { useEffect, useState } from "react"
import { ButtonTheme } from "../../../../components/ButtonTheme"
import MobilePopupMenu from "../../../../components/MobilePopupMenu"
import NavBar from "../../../../components/NavBar"
import { auth } from "../../../../utils/FirebaseUtils"

export default function EventsAppNavBar({ title, back, transparentDepth, opaqueDepth, sidePadding }) {
  const [authUser, setAuthUser] = useState(auth.currentUser)
  const rightElements = []

  useEffect(() => {
    return onAuthStateChanged(auth, authUser => {
      setAuthUser(authUser)
    })
  }, [])

  if (authUser) {
    const menuElement = <MobilePopupMenu 
      navItems={[
        {
          title: "My tickets",
          path: "/events/s/tickets"
        },
        {
          title: "Sign out",
          action: async () => { 
            await auth.signOut()
          }
        },
      ]}
      buttonTheme={ButtonTheme.MONOCHROME_REVERSED}
    />

    rightElements.push(menuElement)
  }
  
  return <NavBar
    rightElements={rightElements}
    title={title}
    back={back}
    transparentDepth={transparentDepth}
    opaqueDepth={opaqueDepth}
    sidePadding={sidePadding}
  />
}


