import { useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import Tick from "../../../assets/icons/Tick";
import { Colors } from "../../../components/CircleButton";
import IconActionPage from "../../../components/IconActionPage";
import LoadingPage from "../../../components/LoadingPage";
import { NetworkManager } from "../../../utils/NetworkManager";

export default function CrezcoConnectRedirectPage() {
  const [registered, setRegistered] = useState(false);
  const { merchantId } = useParams()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const crezcoUserId = searchParams.get("user-id")

  useEffect(() => {
    if (registered) { return }

    NetworkManager.put(`/merchants/m/${merchantId}/crezco`, { crezcoUserId }).then(() => {
      console.log("worked")
      setRegistered(true)
    }).catch(err => {
      console.log(err)
    })
  }, [registered, merchantId, crezcoUserId])

  const handleGoToEventsPage = () => {
    navigate(`/dashboard/o/${merchantId}/events`)
  }

  if (registered) {
    return <IconActionPage
      Icon={Tick}
      iconBackgroundColor={Colors.OFF_WHITE_LIGHT}
      iconForegroundColor={Colors.BLACK}
      title="Bank details added"
      body="You're now all set up to receive payments! Now let's go to your events page to create your first event."
      primaryAction={handleGoToEventsPage}
      primaryActionTitle="Go to events page"
    />
  } else {
    return <LoadingPage
      iconBackgroundColor={Colors.BLACK}
      iconForegroundColor={Colors.WHITE}
    />
  }
}
