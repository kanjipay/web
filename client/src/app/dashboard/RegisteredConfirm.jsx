import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import Tick from "../../assets/icons/Tick";
import { Colors } from "../../components/CircleButton";
import IconPage from "../../components/IconPage";
import LoadingPage from "../../components/LoadingPage";
import { NetworkManager, ApiName } from "../../utils/NetworkManager";

export default function RegisteredConfirm() {
  const [registered, setRegistered] = useState(false);
  const { merchantId } = useParams()
  const [searchParams] = useSearchParams()
  const crezcoUserId = searchParams.get("user-id")
  

  useEffect(() => {
    if (registered) { return }

    const paymentRegisterBody = { merchantId, crezcoUserId };

    NetworkManager.post(
      ApiName.INTERNAL,
      "/payees/update",
      paymentRegisterBody
    ).then(() => {
      console.log("worked")
      setRegistered(true)
    }).catch(err => {
      console.log(err)
    })
  }, [registered, merchantId, crezcoUserId])

  if (registered) {
    return <IconPage
      Icon={Tick}
      iconBackgroundColor={Colors.BLACK}
      iconForegroundColor={Colors.WHITE}
      title="Thank you for registering!"
      body="We have registered you as an organiser"
    />
  } else {
    return <LoadingPage
      iconBackgroundColor={Colors.BLACK}
      iconForegroundColor={Colors.WHITE}
    />
    
  }
}
