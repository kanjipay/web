import * as base64 from "base-64"
import { useLocation, useNavigate } from "react-router-dom"

export function useOpenAuthPage() {
  const navigate = useNavigate()
  const location = useLocation()

  return (successPath, successState = {}, showsBack = true, backPath = null) => {
    const actualBackPath = backPath ?? location.pathname

    let search = `?success=${base64.encode(successPath)}&state=${base64.encode(JSON.stringify(successState))}`

    if (showsBack) {
      search += `&back=${base64.encode(actualBackPath)}`
    }
    navigate({
      pathname: "/events/auth",
      search
    })
  }
}