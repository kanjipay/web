import * as base64 from "base-64"
import { fetchSignInMethodsForEmail } from "firebase/auth"
import { useLocation, useNavigate } from "react-router-dom"
import { auth } from "../../utils/FirebaseUtils"

export async function doesUserRequireAuth({ user, requirePassword }) {
  if (user && user.email) {
    if (requirePassword) {
      const providerIds = user.providerData.map(d => d.providerId)

      if (providerIds.includes("google")) {
        return false
      }

      const signInMethodsForEmail = await fetchSignInMethodsForEmail(user.email)

      return !signInMethodsForEmail.includes("password")
    } else {
      return false
    }
  } else {
    return true
  }
}

export function useOpenAuthPage() {
  const navigate = useNavigate()
  const location = useLocation()

  return ({
    successPath, 
    successState = {}, 
    showsBack = true, 
    backPath, 
    requiresPassword = true,
  }) => {
    const actualBackPath = backPath ?? location.pathname

    let search = `?success=${base64.encode(successPath)}&state=${base64.encode(JSON.stringify(successState))}`

    if (showsBack) {
      search += `&back=${base64.encode(actualBackPath)}`
    }

    navigate({
      pathname: "/auth",
      search,
    }, {
      state: {
        requiresPassword,
      }
    })
  }
}