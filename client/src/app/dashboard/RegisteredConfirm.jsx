import {  useState } from "react";
import Tick from "../../assets/icons/Tick";
import { Colors } from "../../components/CircleButton";
import IconPage from "../../components/IconPage";
import LoadingPage from "../../components/LoadingPage";
import {updateDoc } from "firebase/firestore";
import Collection  from "../../enums/Collection";
import { NetworkManager, ApiName } from "../../utils/NetworkManager";




export default function RegisteredConfirm() {
  const [registered, setRegistered] = useState(false);
  const queryParams = new URLSearchParams(window.location.search)
  const merchantId = queryParams.get("merchant-id");
  const crezcoId = queryParams.get("user-id");
  const paymentRegisterBody = {merchantId:crezcoId}
  NetworkManager.post(ApiName.INTERNAL, '/merchants/create',  paymentRegisterBody)
  console.log('registered')
  if (registered){
    return <IconPage 
    Icon={Tick}
    iconBackgroundColor={Colors.PRIMARY_LIGHT}
    iconForegroundColor={Colors.PRIMARY}
    title="Registered with Crezco"
    body="We have registered you with our payment processing partner, Crezco"
  />
  } else {
    /*SavePayeeDetails(merchantId, crezcoId)*/
    setRegistered(true)
    return <LoadingPage/>
  }
}