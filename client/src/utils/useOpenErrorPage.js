import { useLocation, useNavigate } from "react-router-dom";
import * as base64 from "base-64"

export function useOpenErrorPage() {
  const navigate = useNavigate()
  const location = useLocation()

  return ({
    title,
    body,
    backPath,
    state={}
  }) => {
    const actualBackPath = backPath ?? location.pathname
    const search = `?back=${base64.encode(actualBackPath)}&state=${base64.encode(state)}`

    navigate({ pathname: "/error", search })
  }
}