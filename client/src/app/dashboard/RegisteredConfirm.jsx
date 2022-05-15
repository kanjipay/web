import { useState } from "react";
import Tick from "../../assets/icons/Tick";
import { Colors } from "../../components/CircleButton";
import IconPage from "../../components/IconPage";
import LoadingPage from "../../components/LoadingPage";
import { NetworkManager, ApiName } from "../../utils/NetworkManager";

export default function RegisteredConfirm() {
  const [registered, setRegistered] = useState(false);
  const queryParams = new URLSearchParams(window.location.search);
  const merchantId = queryParams.get("merchant-id");
  const crezcoUserId = queryParams.get("user-id");
  const paymentRegisterBody = { merchantId, crezcoUserId };

  console.log("registered");
  if (registered) {
    return (
      <IconPage
        Icon={Tick}
        iconBackgroundColor={Colors.BLACK}
        iconForegroundColor={Colors.WHITE}
        title="Thank you for registering!"
        body="We have registered you as an organiser"
      />
    );
  } else {
    NetworkManager.post(
      ApiName.INTERNAL,
      "/payees/update",
      paymentRegisterBody
    ).then(setRegistered(true));
    return (
      <LoadingPage
        iconBackgroundColor={Colors.BLACK}
        iconForegroundColor={Colors.WHITE}
      />
    );
  }
}
