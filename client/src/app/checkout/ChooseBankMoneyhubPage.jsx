import { useEffect, useState } from "react"
import { isMobile } from "react-device-detect"
import { Helmet } from "react-helmet-async"
import QRCode from "react-qr-code"
import { useNavigate, useSearchParams } from "react-router-dom"
import Discover from "../../assets/icons/Discover"
import Spinner from "../../assets/Spinner"
import { Colors } from "../../enums/Colors"
import { ButtonTheme } from "../../components/ButtonTheme"
import CircleIcon from "../../components/CircleIcon"
import LoadingPage from "../../components/LoadingPage"
import MainButton from "../../components/MainButton"
import NavBar from "../../components/NavBar"
import OrDivider from "../../components/OrDivider"
import Spacer from "../../components/Spacer"
import Collection from "../../enums/Collection"
import { formatCurrency } from "../../utils/helpers/money"
import { IdentityManager } from "../../utils/IdentityManager"
import { createLink } from "../../utils/services/LinksService"
import BankTile from "./BankTile"
import { fetchMoneyhubBankData } from "./fetchMoneyhubBankData"
import { cancelOrder } from "./cancelOrder"

export default function ChooseBankMoneyhubPage({ order }) {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const referringDeviceId = searchParams.get("referringDeviceId")
  const bankIdFromQuery = searchParams.get("bank")
  const bankIdFromStorage = localStorage.getItem("moneyhubBankId")
  const initialBankId = bankIdFromQuery ?? bankIdFromStorage

  const [isLoading, setIsLoading] = useState(true)
  const [bankId, setBankId] = useState(initialBankId)
  const [bankData, setBankData] = useState([])
  const [bankName, setBankName] = useState("")
  const [filteredBankData, setFilteredBankData] = useState([])
  const [linkId, setLinkId] = useState(null)

  const handleBankNameChange = (event) => {
    const enteredBankName = event.target.value
    console.log(enteredBankName)
    setBankName(enteredBankName)

    if (enteredBankName.length >= 2) {
      const filteredData = bankData.filter((datum) => {
        return datum.name.toLowerCase().includes(enteredBankName.toLowerCase())
      })

      setFilteredBankData(filteredData)
    } else {
      setFilteredBankData(bankData)
    }
  }

  const handleClickBack = async () => {
    await cancelOrder(order.id, navigate)
  }

  const handleChooseBank = (bankDatum) => {
    setBankId(bankDatum.id)
  }

  const handleContinueToBank = () => {
    localStorage.setItem("moneyhubBankId", bankId)
    navigate("../payment", { state: { bankId, referringDeviceId } })
  }

  const handleChooseAnotherBank = () => {
    setBankId(null)
  }

  function generateLink(linkId) {
    const redirectUrl = new URL(window.location.href)
    redirectUrl.pathname = `/link/${linkId}`
    return redirectUrl.href
  }

  useEffect(() => {
    fetchMoneyhubBankData().then((bankData) => {
      console.log(bankData)
      setBankData(bankData)
      setFilteredBankData(bankData)
      setIsLoading(false)
    })
  }, [])

  useEffect(() => {
    if (bankId && !isMobile) {
      const deviceId = IdentityManager.main.getDeviceId()
      createLink(
        `/checkout/o/${order.id}/choose-bank?referringDeviceId=${deviceId}&bank=${bankId}`
      ).then((linkId) => {
        setLinkId(linkId)
      })
    } else {
      setLinkId(null)
    }
  }, [order, bankId])

  useEffect(() => {
    if (!linkId) {
      return
    }

    return Collection.LINK.onChange(linkId, (link) => {
      if (link.wasUsed) {
        navigate("../mobile-handover")
      }
    })
  }, [linkId, navigate])

  if (isLoading) {
    return <LoadingPage />
  } else if (bankId) {
    const bankDatum = bankData.find((d) => d.id === bankId)
    const { name, iconUrl } = bankDatum
    return (
      <div className="container">
        <Helmet>
          <title>Checkout | Mercado</title>
        </Helmet>
        <NavBar
          title="Confirm your bank"
          back={handleChooseAnotherBank}
        />
        <Spacer y={12} />

        <div className="content">
          <div
            style={{
              padding: "0 16px",
              textAlign: "center",
              margin: "auto",
              maxWidth: 311,
            }}
          >
            <BankTile
              name={name}
              imageRef={iconUrl}
              style={{ width: 160, margin: "auto" }}
            />
            <Spacer y={2} />
            <h3 className="header-s">We're redirecting you to your bank</h3>
            <Spacer y={2} />
            <p className="text-body-faded">
              You'll be sent back here after you confirm your payment of{" "}
              <span style={{ fontWeight: 800 }}>
                {formatCurrency(paymentIntent.amount)}
              </span>
            </p>
          </div>
        </div>

        <div
          style={{
            position: "absolute",
            bottom: 0,
            padding: "0 16px",
            textAlign: "center",
          }}
        >
          {!isMobile && (
            <div>
              <div>
                <div style={{ display: "flex", columnGap: 32 }}>
                  <div style={{ flexGrow: 10, textAlign: "left" }}>
                    <h3 className="header-s">
                      Continue on mobile (recommended)
                    </h3>
                    <Spacer y={2} />
                    <p className="text-body-faded">
                      If you have your bank’s mobile app installed, scan the QR
                      code with your phone to confirm your payment there.
                    </p>
                  </div>
                  <div style={{ flexShrink: 10 }}>
                    {linkId ? (
                      <QRCode size={160} value={generateLink(linkId)} />
                    ) : (
                      <div
                        style={{
                          width: 160,
                          height: 160,
                          position: "relative",
                        }}
                      >
                        <Spinner
                          length={32}
                          style={{
                            position: "absolute",
                            top: "50%",
                            left: "50%",
                            transform: "translate(-50%, 50%)",
                          }}
                        />
                      </div>
                    )}
                  </div>
                </div>
                <Spacer y={3} />
                <OrDivider />
                <Spacer y={3} />
              </div>
            </div>
          )}

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
            By continuing you are permitting Moneyhub to initiate a payment from
            your bank account. You also agree to Moneyhub's
            <a
              href="https://www.moneyhub.com/terms-of-use"
              target="_blank"
              rel="noreferrer"
            >
              {" "}
              Terms of Use{" "}
            </a>
            and
            <a
              href="https://www.moneyhub.com/privacy-policy-and-cookies"
              target="_blank"
              rel="noreferrer"
            >
              {" "}
              Privacy Policy
            </a>
            .
          </p>
          <Spacer y={3} />
        </div>
      </div>
    )
  } else {
    return (
      <div className="container">
        <Helmet>
          <title>Choose your bank | Mercado</title>
        </Helmet>
        <NavBar title="Choose your bank" back={handleClickBack} />

        <div className="content">
          <Spacer y={9} />
          <div style={{ textAlign: "center" }}>
            <p className="text-body-faded">
              Securely connect to your bank account and pay by bank transfer.
            </p>
            <Spacer y={3} />
            <div
              style={{
                display: "flex",
                alignItems: "center",
                height: 48,
                padding: "0 16px 0 8px",
                backgroundColor: Colors.OFF_WHITE_LIGHT,
                overflow: "hidden",
                columnGap: 8,
              }}
            >
              <Discover length={32} color={Colors.BLACK} />
              <input
                value={bankName}
                onChange={handleBankNameChange}
                placeholder="Search"
                style={{
                  flexGrow: 10,
                  height: "100%",
                  backgroundColor: Colors.OFF_WHITE_LIGHT,
                }}
              />
            </div>
          </div>

          <Spacer y={3} />

          {filteredBankData.length > 0 ? (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                columnGap: 16,
                rowGap: 16,
              }}
            >
              {filteredBankData.map((datum) => (
                <BankTile
                  key={datum.id}
                  name={datum.name}
                  imageRef={datum.iconUrl}
                  onClick={() => handleChooseBank(datum)}
                />
              ))}
            </div>
          ) : (
            <div style={{ textAlign: "center" }}>
              <CircleIcon
                Icon={Discover}
                style={{ margin: "auto" }}
                length={120}
              />
              <Spacer y={2} />
              <h3 className="header-s">We couldn't find that bank</h3>
              <Spacer y={1} />
              <p className="text-body-faded">
                Try searching for a different one.
              </p>
            </div>
          )}

          <Spacer y={8} />
        </div>
      </div>
    )
  }
}
