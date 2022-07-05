import { useNavigate, useSearchParams } from "react-router-dom"
import LoadingPage from "../../components/LoadingPage"
import * as base64 from "base-64"
import { useEffect } from "react"

export default function RedirectPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [successPath] = base64.decode(searchParams.get("success"))
  const successState = JSON.parse(base64.decode(searchParams.get("state")))

  useEffect(() => {
    navigate(successPath, { state: successState })
  }, [navigate, successPath, successState])

  return <LoadingPage />
}
