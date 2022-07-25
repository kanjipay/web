import { useEffect, useState } from "react"
import { isMobile } from "react-device-detect"
import { Helmet } from "react-helmet-async"
import QRCode from "react-qr-code"
import { useNavigate, useSearchParams } from "react-router-dom"
import Discover from "../../assets/icons/Discover"
import Spinner from "../../assets/Spinner"
import { Colors } from "../../enums/Colors"
import CircleIcon from "../../components/CircleIcon"
import MainButton from "../../components/MainButton"
import NavBar from "../../components/NavBar"
import OrDivider from "../../components/OrDivider"
import Spacer from "../../components/Spacer"
import { IdentityManager } from "../../utils/IdentityManager"
import { NetworkManager } from "../../utils/NetworkManager"
import { createLink } from "../../utils/services/LinksService"
import BankTile from "./BankTile"
// import { useIntl } from "react-intl"
// import { getCountryCode } from "../../utils/helpers/money"
// import Dropdown from "../../components/input/Dropdown"
import { cancelOrder } from "./cancelOrder"
import Collection from "../../enums/Collection"
import { AnalyticsManager } from "../../utils/AnalyticsManager"
import LoadingPage from "../../components/LoadingPage"
import { PaymentType } from "../../enums/PaymentType"
import { formatCurrency } from "../../utils/helpers/money"

function AcceptedCards() {
  return (
    <div style={{ display: "flex", alignItems: "center", columnGap: 16 }}>
      <p className="text-body-faded">We accept: </p>
      <img src="/img/visa.png" alt="Visa" style={{ height: 40 }} />
      <img src="/img/mastercard.png" alt="Mastercard" style={{ height: 32 }} />
      <img src="/img/amex.png" alt="American Express" style={{ height: 32 }} />
    </div>
  )
}

const cachedBankFileNamePrefix = ["PROD", "STAGING"].includes(
  process.env.REACT_APP_ENV_NAME
)
  ? "Prod"
  : "Sandbox"
const cachedBankData = require(`./crezcoBanks${cachedBankFileNamePrefix}.json`)

export default function ChooseBankCrezcoPage({ order }) {
  const navigate = useNavigate()
  // const intl = useIntl()
  const [searchParams] = useSearchParams()
  const referringDeviceId = searchParams.get("referringDeviceId")
  const bankCodeFromQuery = searchParams.get("bank")
  const bankCodeFromStorage = localStorage.getItem("crezcoBankCode")
  // const countryCodeFromStorage = localStorage.getItem("countryCode")

  // const [countryCode, setCountryCode] = useState(countryCodeFromStorage ?? getCountryCode(intl.locale))
  const [countryCode, setCountryCode] = useState("GB") // Hardcode until EU OB payments work
  const [bankCode, setBankCode] = useState(null)
  const [bankData, setBankData] = useState(cachedBankData)
  const [bankName, setBankName] = useState("")
  const [filteredBankData, setFilteredBankData] = useState([])
  const [linkId, setLinkId] = useState(null)

  const handleCountryCodeChange = (event) => {
    const countryCode = event.target.value
    localStorage.setItem("countryCode", countryCode)
    setCountryCode(countryCode)
  }

  const canPayWithCard = order?.paymentTypes?.includes(PaymentType.STRIPE)

  const handlePayWithCard = () => navigate("../payment-stripe")

  const handleBankNameChange = (event) => {
    const enteredBankName = event.target.value
    setBankName(enteredBankName)

    if (enteredBankName.length >= 2) {
      const filteredData = bankData.filter((datum) => {
        return datum.bankName
          .toLowerCase()
          .includes(enteredBankName.toLowerCase())
      })

      setFilteredBankData(filteredData)
    } else {
      setFilteredBankData(bankData)
    }
  }

  const handleClickBack = async () => {
    await cancelOrder(order, navigate)
  }

  const handleChooseBank = (bankDatum) => {
    const code = bankDatum.bankCode
    localStorage.setItem("crezcoBankCode", code)
    AnalyticsManager.main.logEvent("ChooseBank", { crezcoBankCode: code })

    setBankCode(code)

    if (isMobile) {
      AnalyticsManager.main.pressButton("ContinueToBank", {
        isMobile,
        crezcoBankCode: bankCode,
      })

      navigate("../payment", {
        state: { bankCode: code, countryCode, referringDeviceId },
      })
    }
  }

  const handleContinueToBank = () => {
    AnalyticsManager.main.pressButton("ContinueToBank", {
      isMobile,
      crezcoBankCode: bankCode,
    })

    navigate("../payment", {
      state: { bankCode, countryCode, referringDeviceId },
    })
  }

  const handleChooseAnotherBank = () => {
    localStorage.removeItem("crezcoBankCode")
    setBankCode(null)
  }

  function generateLink(linkId) {
    const redirectUrl = new URL(window.location.href)
    redirectUrl.pathname = `/link/${linkId}`
    return redirectUrl.href
  }

  useEffect(() => {
    AnalyticsManager.main.viewPage("ChooseBank", {
      cachedBankId: bankCodeFromStorage,
    })
  }, [bankCodeFromStorage])

  useEffect(() => {
    NetworkManager.get(`/banks/${countryCode}`).then((res) => {
      setBankData(res.data)
    })
  }, [bankCodeFromQuery, bankCodeFromStorage, countryCode])

  useEffect(() => {
    const sortedData = bankData.sort((bankDatum1, bankDatum2) => {
      return bankDatum1.bankName > bankDatum2.bankName ? 1 : -1
    })

    setFilteredBankData(sortedData)

    const bankCodes = sortedData.map((bankDatum) => bankDatum.bankCode)
    const initialBankCode = bankCodeFromQuery ?? bankCodeFromStorage

    if (bankCodeFromStorage && !bankCodes.includes(bankCodeFromStorage)) {
      localStorage.removeItem("crezcoBankCode")
    }

    if (bankCodes.includes(initialBankCode)) {
      setBankCode(initialBankCode)
    }
  }, [bankData, bankCodeFromQuery, bankCodeFromStorage])

  useEffect(() => {
    if (bankCode && !isMobile) {
      if (!linkId) {
        const deviceId = IdentityManager.main.getDeviceId()
        createLink(
          `/checkout/o/${order.id}/choose-bank?referringDeviceId=${deviceId}&bank=${bankCode}`
        ).then((linkId) => {
          setLinkId(linkId)
        })
      }
    } else {
      setLinkId(null)
    }
  }, [order, bankCode, linkId])

  useEffect(() => {
    if (!linkId) {
      return
    }

    return Collection.LINK.onChange(linkId, (link) => {
      console.log(link)
      if (link.wasUsed) {
        navigate("../mobile-handover")
      }
    })
  }, [linkId, navigate])

  if (bankCode) {
    const bankDatum = bankData.find((d) => d.bankCode === bankCode)

    if (!bankDatum) return <LoadingPage />
    const { bankName, logoUrl } = bankDatum

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
            <div style={{ display: "inline-block" }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  columnGap: 16,
                  margin: "auto",
                }}
              >
                <img
                  alt={bankName}
                  src={logoUrl}
                  style={{ width: 80, height: 80 }}
                />
                <p>+</p>
                <img
                  alt="crezco"
                  src="/img/crezco.png"
                  style={{ width: 80, height: 80 }}
                />
              </div>
            </div>

            <Spacer y={3} />
            <p className="text-body">
              We're redirecting you to {bankName} using Crezco to confirm your
              payment of {formatCurrency(order.total, order.currency)}.
            </p>
          </div>
        </div>

        <div className="anchored-bottom">
          <div style={{ margin: 16 }}>
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
                        If you have your bank’s mobile app installed, scan the
                        QR code with your phone to confirm your payment there.
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
              test-id="continue-to-bank-button"
              onClick={handleContinueToBank}
            />
            {/* <Spacer y={1} />
        <MainButton
          title="Choose another bank"
          onClick={handleChooseAnotherBank}
          buttonTheme={ButtonTheme.MONOCHROME_OUTLINED}
        /> */}
            {/* <Spacer y={2} />
        <p className="text-caption">
          By continuing you are permitting Crezco to initiate a payment from your bank account. You also agree to Crezco's
          <a href="https://www.crezco.com/terms" target="_blank" rel="noreferrer"> Terms of Use </a>
          and
          <a href="https://www.crezco.com/privacy-policy" target="_blank" rel="noreferrer"> Privacy Policy</a>.
        </p>
        <Spacer y={3} /> */}
          </div>
        </div>
      </div>
    )
  } else {
    function isBusinessBankAccount(bankDatum) {
      const businessKeywords = ["business", "corporate", "bankline", "tide"]

      return businessKeywords.some((k) =>
        bankDatum.bankName.toLowerCase().includes(k)
      )
    }

    const businessBankData = filteredBankData.filter((d) =>
      isBusinessBankAccount(d)
    )
    const personalBankData = filteredBankData.filter(
      (d) => !isBusinessBankAccount(d)
    )
    const commonBankNames = ["monzo", "starling", "revolut", "mock"]
    const commonBankData = personalBankData.filter((d) =>
      commonBankNames.some((name) => d.bankName.toLowerCase().includes(name))
    )
    const uncommonBankData = personalBankData.filter(
      (d) =>
        !commonBankNames.some((name) => d.bankName.toLowerCase().includes(name))
    )

    const sections = [
      { title: "Most used", data: commonBankData },
      { title: "Personal banks", data: uncommonBankData },
      { title: "Business banks", data: businessBankData },
    ]

    return (
      <div className="container">
        <Helmet>
          <title>Checkout | Mercado</title>
        </Helmet>
        <NavBar title="Checkout" back={handleClickBack} />

        <div className="content">
          <Spacer y={9} />

          <div style={{ display: "flex", alignItems: "center" }}>
            <h2 className="header-m">Pay by bank transfer</h2>
            <div className="flex-spacer"></div>
            <img src="/img/crezco.png" alt="Crezco" style={{ height: 40 }} />
          </div>
          <Spacer y={2} />
          <p className="text-body-faded">
            We'll redirect you to our payments partner Crezco to confirm the
            payment.
          </p>
          <Spacer y={3} />
          <div style={{ display: "flex", columnGap: 16 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                height: 48,
                padding: "0 16px 0 8px",
                backgroundColor: Colors.OFF_WHITE_LIGHT,
                overflow: "hidden",
                columnGap: 8,
                flexGrow: 100,
              }}
            >
              <Discover length={32} color={Colors.GRAY_LIGHT} />
              <input
                value={bankName}
                onChange={handleBankNameChange}
                placeholder="Search for a bank"
                style={{
                  flexGrow: 10,
                  height: "100%",
                  backgroundColor: Colors.OFF_WHITE_LIGHT,
                }}
              />
            </div>

            {/* <Dropdown 
            width="auto"
            position="bottom right"
            optionList={[
              { label: "British banks", value: "GB" },
              { label: "Irish banks", value: "IE" }
            ]}
            name="bankCountrySelect"
            value={countryCode}
            onChange={handleCountryCodeChange}
          /> */}
          </div>

          <Spacer y={3} />

          {filteredBankData.length > 0 ? (
            <div>
              {sections.map(
                (section, index) =>
                  section.data.length > 0 && (
                    <div key={index}>
                      <h2 className="header-s">{section.title}</h2>
                      <Spacer y={2} />
                      {section.data.map((datum) => {
                        return (
                          <div key={datum.bankCode}>
                            <BankTile
                              name={datum.bankName}
                              imageRef={datum.logoUrl}
                              onClick={() => handleChooseBank(datum)}
                            />
                            <Spacer y={2} />
                          </div>
                        )
                      })}
                      <Spacer y={3} />
                    </div>
                  )
              )}
              {canPayWithCard && (
                <div>
                  <OrDivider />
                  <Spacer y={3} />
                  <MainButton
                    title="Pay with card"
                    onClick={handlePayWithCard}
                  />
                  <Spacer y={1} />
                  <AcceptedCards />
                </div>
              )}
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

              {canPayWithCard ? (
                <div>
                  <p className="text-body-faded">
                    Try searching for a different one, or pay with card instead.
                  </p>
                  <Spacer y={6} />
                  <div style={{ maxWidth: 400, margin: "auto" }}>
                    <MainButton
                      title="Pay with card"
                      onClick={handlePayWithCard}
                    />
                    <Spacer y={1} />
                    <AcceptedCards />
                  </div>
                </div>
              ) : (
                <p className="text-body-faded">
                  Try searching for a different one.
                </p>
              )}
            </div>
          )}

          <Spacer y={8} />
        </div>
      </div>
    )
  }
}
