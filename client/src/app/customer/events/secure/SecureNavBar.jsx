import { getAuth, onAuthStateChanged } from "firebase/auth";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import User from "../../../../assets/icons/User";
import CircleButton, { ButtonTheme } from "../../../../components/CircleButton";
import NavBar from "../../../../components/NavBar";
import { auth } from "../../../../utils/FirebaseUtils";

export default function SecureNavBar({
  showsBackButton = true,
  backAction,
  backPath,
  title,
  titleElement,
  leftElements = [],
  rightElements = [],
  transparentDepth,
  opaqueDepth,
  profilePath
}) {
  const navigate = useNavigate()
  const [user, setUser] = useState(auth.currentUser)

  useEffect(() => {
    onAuthStateChanged(auth, user => {
      setUser(user)
    })
  }, [])

  const profileElement = (<CircleButton
    length={32}
    Icon={User}
    buttonTheme={ButtonTheme.NAVBAR}
    onClick={() => navigate(profilePath)}
  />)

  function generateRightElements() {
    if (user) {
      return rightElements.concat([profileElement])
    } else {
      return rightElements
    }
  }

  const props = {
    showsBackButton,
    backAction,
    backPath,
    title,
    titleElement,
    leftElements,
    rightElements: generateRightElements(),
    transparentDepth,
    opaqueDepth,
  }
  
  return <NavBar {...props}/>
}