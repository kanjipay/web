import { onSnapshot } from "firebase/firestore"
import { useEffect, useState } from "react"
import { isMobile } from "react-device-detect"
import { Helmet } from "react-helmet-async"
import QRCode from "react-qr-code"
import { useNavigate, useSearchParams } from "react-router-dom"
import Discover from "../../assets/icons/Discover"
import Spinner from "../../assets/Spinner"
import { ButtonTheme, Colors } from "../../components/CircleButton"
import CircleIcon from "../../components/CircleIcon"
import TextField from "../../components/Input"
import LoadingPage from "../../components/LoadingPage"
import MainButton from "../../components/MainButton"
import NavBar from "../../components/NavBar"
import OrDivider from "../../components/OrDivider"
import Spacer from "../../components/Spacer"
import Collection from "../../enums/Collection"
import { formatCurrency } from "../../utils/helpers/money"
import { IdentityManager } from "../../utils/IdentityManager"
import { ApiName, NetworkManager } from "../../utils/NetworkManager"
import { createLink } from "../../utils/services/LinksService"
import BankTile from "./BankTile"
import { cancelPaymentIntent } from "./redirects"

export default function ChooseBankCrezcoPage({ paymentIntent }) {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const referringDeviceId = searchParams.get("referringDeviceId")
  const bankCodeFromQuery = searchParams.get("bank")
  const bankCodeFromStorage = localStorage.getItem("crezcoBankCode")
  const initialBankCode = bankCodeFromQuery ?? bankCodeFromStorage
  const [isLoading, setIsLoading] = useState(true)
  const [bankCode, setBankCode] = useState(null)
  const [bankData, setBankData] = useState([])
  const [bankName, setBankName] = useState("")
  const [filteredBankData, setFilteredBankData] = useState([])
  const [linkId, setLinkId] = useState(null)

  const removeBankIfInvalid = (bankData) => {
    const bankDatum = bankData.find(d => d.bankCode === bankCode);
    if (!bankDatum) {
      setBankData([]);
      setBankCode(null);
      localStorage.removeItem("crezcoBankCode");
    } 
  }

  const handleBankNameChange = (event) => {
    const enteredBankName = event.target.value
    setBankName(enteredBankName)

    if (enteredBankName.length >= 2) {
      const filteredData = bankData.filter(datum => {
        return datum.bankName.toLowerCase().includes(enteredBankName.toLowerCase())
      })

      setFilteredBankData(filteredData)
    } else {
      setFilteredBankData(bankData)
    }
  }

  const handleClickBack = () => {
    setIsLoading(true)

    cancelPaymentIntent(paymentIntent).then(redirectUrl => {
      window.location.href = redirectUrl
    })
  }

  const handleChooseBank = (bankDatum) => {
    setBankCode(bankDatum.bankCode)
  }

  const handleContinueToBank = () => {
    localStorage.setItem("crezcoBankCode", bankCode)
    navigate("../payment", { state: { bankCode, referringDeviceId } })
  }

  const handleChooseAnotherBank = () => {
    setBankCode(null)
  }

  function generateLink(linkId) {
    const redirectUrl = new URL(window.location.href);
    redirectUrl.pathname = `/link/${linkId}`;
    return redirectUrl.href
  }

  useEffect(() => {
    NetworkManager.get(ApiName.INTERNAL, "/banks").then(res => {
      const bankData = res.data
      setBankData(bankData)

      const bankCodes = bankData.map(bankDatum => bankDatum.bankCode)

      if (!bankCodes.includes(bankCodeFromStorage)) {
        localStorage.removeItem("crezcoBankCode")
      }

      const initialBankCode = bankCodeFromQuery ?? bankCodeFromStorage

      if (bankCodes.includes(initialBankCode)) {
        setBankCode(initialBankCode)
      }

      setFilteredBankData(bankData)
      setIsLoading(false)

    })
  }, [bankCodeFromQuery, bankCodeFromStorage])

  useEffect(() => {
    if (bankCode && !isMobile) {
      const deviceId = IdentityManager.main.getDeviceId()
      createLink(`/checkout/pi/${paymentIntent.id}/choose-bank?referringDeviceId=${deviceId}&bank=${bankCode}`).then(linkId => {
        setLinkId(linkId)
      })
    } else {
      setLinkId(null)
    }
  }, [paymentIntent, bankCode])

  useEffect(() => {
    if (!linkId) { return }

    const unsub = onSnapshot(Collection.LINK.docRef(linkId), doc => {
      const { wasUsed } = doc.data()

      if (wasUsed) {
        navigate("../mobile-handover")
      }
    })

    return unsub
  }, [linkId, navigate])

  if (isLoading) {
    return <LoadingPage />
  } else if (bankCode) {
    const bankDatum = bankData.find(d => d.bankCode === bankCode)
    const { bankName, logoUrl } = bankDatum
    return <div className="container">
      <Helmet>
        <title>Checkout | Mercado</title>
      </Helmet>
      <NavBar title="Confirm your bank" backAction={handleChooseAnotherBank} />
      <Spacer y={12} />

      <div className="content">
        <div style={{ padding: "0 16px", textAlign: "center", margin: "auto", maxWidth: 311 }}>
          <BankTile name={bankName} imageRef={logoUrl} style={{ width: 160, margin: "auto" }} />
          <Spacer y={2} />
          <h3 className="header-s">We're redirecting you to your bank</h3>
          <Spacer y={2} />
          <p className="text-body-faded">We'll use our trusted partner Crezco to do this. You'll be sent back here after you confirm your payment of <span style={{ fontWeight: 800 }}>{formatCurrency(paymentIntent.amount)}</span></p>
        </div>

        <Spacer y={6} />
        {!isMobile && <div>

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
        </div>}

        <MainButton
          title={isMobile ? "Continue to my bank" : "Continue on desktop"}
          onClick={handleContinueToBank}
        />
        <Spacer y={1} />
        <MainButton
          title="Choose another bank"
          onClick={handleChooseAnotherBank}
          buttonTheme={ButtonTheme.MONOCHROME_OUTLINED}
        />
        <Spacer y={2} />
        <p className="text-caption">
          By continuing you are permitting Crezco to initiate a payment from your bank account. You also agree to Crezco's
          <a href="https://www.crezco.com/terms" target="_blank" rel="noreferrer"> Terms of Use </a>
          and
          <a href="https://www.crezco.com/privacy-policy" target="_blank" rel="noreferrer"> Privacy Policy</a>.
        </p>
        <Spacer y={3} />


      </div>

      <div style={{ position: "absolute", bottom: 0, padding: "0 16px", textAlign: "center" }}>
        
      </div>
    </div>
  } else {
    return <div className="container">
      <Helmet>
        <title>Choose your bank | Mercado</title>
      </Helmet>
      <NavBar title="Choose your bank" backAction={handleClickBack} />

      <div className="content">
        <Spacer y={9} />
        <div style={{ padding: "0 16px", textAlign: "center" }}>
          <p className="text-body-faded">Securely connect to your bank account and pay by bank transfer.</p>
          <Spacer y={3} />
          <div style={{
            display: "flex",
            alignItems: "center",
            height: 48,
            padding: "0 16px 0 8px",
            backgroundColor: Colors.OFF_WHITE_LIGHT,
            overflow: "hidden",
            columnGap: 8
          }}>
            <Discover length={32} color={Colors.BLACK} />
            <input
              value={bankName}
              onChange={handleBankNameChange}
              placeholder="Search"
              style={{ flexGrow: 10, height: "100%", backgroundColor: Colors.OFF_WHITE_LIGHT }} />
          </div>
        </div>

        <Spacer y={3} />

        {
          filteredBankData.length > 0 ?
            <div style={{ display: 'grid', gridTemplateColumns: "1fr 1fr", columnGap: 16, rowGap: 16 }}>
              {
                filteredBankData.map(datum => <BankTile key={datum.bankCode} name={datum.bankName} imageRef={datum.logoUrl} onClick={() => handleChooseBank(datum)} />)
              }
            </div> :
            <div style={{ textAlign: "center" }}>
              <CircleIcon
                Icon={Discover}
                style={{ margin: "auto" }}
                length={120}
              />
              <Spacer y={2} />
              <h3 className="header-s">We couldn't find that bank</h3>
              <Spacer y={1} />
              <p className="text-body-faded">Try searching for a different one.</p>
            </div>
        }

        <Spacer y={8} />
      </div>
    </div>
  }
}