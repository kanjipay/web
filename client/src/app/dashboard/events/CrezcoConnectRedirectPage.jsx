import { useEffect, useState } from "react"
import { useNavigate, useParams, useSearchParams } from "react-router-dom"
import Tick from "../../../assets/icons/Tick"
import { Colors } from "../../../enums/Colors"
import IconActionPage from "../../../components/IconActionPage"
import LoadingPage from "../../../components/LoadingPage"
import { NetworkManager } from "../../../utils/NetworkManager"

export default function CrezcoConnectRedirectPage() {
  const [registered, setRegistered] = useState(false)
  const { merchantId } = useParams()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const crezcoUserId = searchParams.get("user-id")

  useEffect(() => {
    if (registered) {
      return
    }

    NetworkManager.put(`/merchants/m/${merchantId}/crezco`, { crezcoUserId })
      .then(() => {
        setRegistered(true)
      })
      .catch((err) => {
        console.log(err)
      })
  }, [registered, merchantId, crezcoUserId])

  const handleGoToEventsPage = () => {
    navigate(`/dashboard/o/${merchantId}/events`)
  }

  if (registered) {
    return (
      <IconActionPage
        Icon={Tick}
        iconBackgroundColor={Colors.OFF_WHITE_LIGHT}
        iconForegroundColor={Colors.BLACK}
        title="Bank details added"
        body="You're now all set up to receive payments by bank transfer!"
        primaryAction={handleGoToEventsPage}
        primaryActionTitle="Continue"
      />
    )
  } else {
    return (
      <LoadingPage
        iconBackgroundColor={Colors.BLACK}
        iconForegroundColor={Colors.WHITE}
      />
    )
  }
}
