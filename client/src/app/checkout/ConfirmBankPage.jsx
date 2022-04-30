import { Helmet } from "react-helmet-async";
import { useLocation, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { ButtonTheme } from "../../components/CircleButton";
import MainButton from "../../components/MainButton";
import NavBar from "../../components/NavBar";
import Spacer from "../../components/Spacer";
import { formatCurrency } from "../../utils/helpers/money";
import BankTile from "./BankTile";
import { isMobile } from 'react-device-detect';
import { useEffect, useState } from "react";
import { createLink } from "../../utils/services/LinksService";
import { fetchBankDatum } from "./ChooseBankPage";
import LoadingPage from "../../components/LoadingPage";
import { onSnapshot } from "firebase/firestore";
import Collection from "../../enums/Collection";
import OrDivider from "../../components/OrDivider";
import QRCode from "react-qr-code";
import Spinner from "../../assets/Spinner";
import { IdentityManager } from "../../utils/IdentityManager";

export default function ConfirmBankPage({ paymentIntent }) {
  const location = useLocation();
  const bankDatumFromState = location.state?.bankDatum;
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const referringDeviceId = searchParams.get("referringDeviceId")
  
  const bankIdFromUrl = useParams().bankId
  const [linkId, setLinkId] = useState(null)
  const [bankDatum, setBankDatum] = useState(bankDatumFromState)

  function generateLink(linkId) {
    const redirectUrl = new URL(window.location.href);
    redirectUrl.pathname = `/link/${linkId}`;
    return redirectUrl.href
  }

  const handleChooseAnotherBank = () => {
    localStorage.setItem("moneyhubBankId", "")
    navigate("../choose-bank")
  }

  const handleContinueToBank = () => {
    console.log("handleContinueToBank")
    navigate("../payment", { state: { bankId: bankDatum.id, referringDeviceId } })
  }

  useEffect(() => {
    if (bankDatum) {
      if (!isMobile) {
        const deviceId = IdentityManager.main.getDeviceId()
        createLink(`/checkout/${paymentIntent.id}/confirm-bank/${bankDatum.id}?referringDeviceId=${deviceId}`).then(linkId => {
          setLinkId(linkId)
        })
      }
    } else if (bankIdFromUrl) {
      fetchBankDatum(bankIdFromUrl).then(bankDatum => {
        setBankDatum(bankDatum)
      })
    } else {
      console.log("couldn't find bank id on url or bankDatum in local state")
    }
    
  }, [paymentIntent, bankDatum, bankIdFromUrl])

  useEffect(() => {
    if (linkId) {
      const unsub = onSnapshot(Collection.LINK.docRef(linkId), doc => {
        if (doc.data().wasUsed) {
          navigate("../mobile-handover")
        }
      })

      return () => unsub()
    }
  }, [linkId, navigate])

  return bankDatum ?
    <div className="container">
      <Helmet>
        <title>Checkout | Mercado</title>
      </Helmet>
      <NavBar title="Confirm your bank" backAction={handleChooseAnotherBank} />
      <Spacer y={12} />

      <div className="content">
        <div style={{ padding: "0 16px", textAlign: "center", margin: "auto", maxWidth: 311 }}>
          <BankTile bankDatum={bankDatum} style={{ width: 160, margin: "auto" }} />
          <Spacer y={2} />
          <h3 className="header-s">We're redirecting you to your bank</h3>
          <Spacer y={2} />
          <p className="text-body-faded">You'll be sent back here after you confirm your payment of <span style={{ fontWeight: 800}}>{formatCurrency(paymentIntent.amount)}</span></p>
        </div>
      </div>

      <div style={{ position: "absolute", bottom: 0, padding: "0 16px", textAlign: "center" }}>
        { !isMobile && <div>
          
            <div>
              <div style={{ display: "flex", columnGap: 32 }}>
                <div style={{ flexGrow: 10, textAlign: "left" }}>
                  <h3 className="header-s">Continue on mobile (recommended)</h3>
                  <Spacer y={2} />
                  <p className="text-body-faded">If you have your bank’s mobile app installed, scan the QR code with your phone to confirm your payment there.</p>
                </div>
                <div style={{ flexShrink: 10 }}>
                  {
                    linkId ?
                      <QRCode size={160} value={generateLink(linkId)} /> :
                      <div style={{ width: 160, height: 160, position: "relative" }}>
                        <Spinner length={32} style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, 50%)" }} />
                      </div>
                  }
                </div>
              </div>
              <Spacer y={3} />
              <OrDivider />
              <Spacer y={3} />

            </div>
        </div> }
            
        <MainButton
          title={isMobile ? "Continue to my bank" : "Continue on desktop"}
          onClick={handleContinueToBank}
        />
        <Spacer y={1} />
        <MainButton
          title="Choose another bank"
          onClick={handleChooseAnotherBank}
          buttonTheme={ButtonTheme.SECONDARY}
        />
        <Spacer y={2} />
        <p className="text-caption">
          By continuing you are permitting Moneyhub to initiate a payment from your bank account. You also agree to Moneyhub's
          <a href="https://www.moneyhub.com/terms-of-use" target="_blank" rel="noreferrer"> Terms of Use </a>
          and
          <a href="https://www.moneyhub.com/privacy-policy-and-cookies" target="_blank" rel="noreferrer"> Privacy Policy</a>.</p>
        <Spacer y={3} />
      </div>
        
        
    </div> :
    <LoadingPage />
}