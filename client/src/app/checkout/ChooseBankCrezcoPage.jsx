import { useEffect, useState } from "react"
import { isMobile } from "react-device-detect"
import { Helmet } from "react-helmet-async"
import QRCode from "react-qr-code"
import { useLocation, useNavigate, useSearchParams } from "react-router-dom"
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
import { cancelOrder } from "./cancelOrder"
import Collection from "../../enums/Collection"
import { AnalyticsManager } from "../../utils/AnalyticsManager"
import LoadingPage from "../../components/LoadingPage"
import { formatCurrency } from "../../utils/helpers/money"
import { AcceptedCards } from "./AcceptedCards"
import { CheckoutCounter } from "./CheckoutCounter"
import { ButtonTheme } from "../../components/ButtonTheme"
import { ShimmerText } from "react-shimmer-effects"
import { Container } from "../brand/FAQsPage"
import { Body } from "../auth/AuthPage"
import Content from "../../components/layout/Content"
import { Flex } from "../../components/Listing"
import FlexSpacer from "../../components/layout/FlexSpacer"
import { UAParser } from "ua-parser-js"

const cachedBankFileNamePrefix = ["PROD", "STAGING"].includes(
  process.env.REACT_APP_ENV_NAME
)
  ? "Prod"
  : "Sandbox"
const cachedBankData = require(`./crezcoBanks${cachedBankFileNamePrefix}.json`)

const userAgent = UAParser(navigator.userAgent)
const browser = userAgent.browser.name
const isMetaWebview = ["Instagram", "Facebook"].includes(browser)

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
  const [hasSelectedBank, setHasSelectedBank] = useState(false)
  const { state } = useLocation()

  const handleCountryCodeChange = (event) => {
    const countryCode = event.target.value
    localStorage.setItem("countryCode", countryCode)
    setCountryCode(countryCode)
  }

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
    await cancelOrder(order.id, navigate)
  }

  const handleChooseBank = (bankDatum) => {
    const code = bankDatum.bankCode
    AnalyticsManager.main.logEvent("ChooseBank", { crezcoBankCode: code })
    setHasSelectedBank(true)

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
    AnalyticsManager.main.viewPage("ChooseBank", { cachedBankId: bankCodeFromStorage })
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
    if (bankCode && !isMobile && order) {
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

  useEffect(() => {
    if (bankCodeFromQuery && referringDeviceId) {
      navigate("../payment", {
        state: { bankCode: bankCodeFromQuery, countryCode, referringDeviceId },
      })
    }
    
  }, [bankCodeFromQuery, referringDeviceId, countryCode, navigate])

  let shouldEmphasiseOpenBanking

  if (isMetaWebview) {
    shouldEmphasiseOpenBanking = false
  } else if (state) {
    shouldEmphasiseOpenBanking = state.shouldEmphasiseOpenBanking
  } else {
    shouldEmphasiseOpenBanking = order?.openBankingPaymentAttempts === 0 && order?.openBankingSettings !== "DEEMPHASISED"
  }

  if (bankCode && (shouldEmphasiseOpenBanking || hasSelectedBank)) {
    const bankDatum = bankData.find((d) => d.bankCode === bankCode)

    if (!bankDatum) return <LoadingPage />
    const { bankName, logoUrl } = bankDatum

    return <Container maxWidth={500}>
      {order && <CheckoutCounter order={order} />}
      <Helmet>
        <title>Checkout | Mercado</title>
      </Helmet>
      <NavBar
        title="Confirm your bank"
        back={handleChooseAnotherBank}
      />

      <Content>
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
          {
            order ?
              <Body>
                {
                  isMobile ?
                    `We're redirecting you to ${bankName} using Crezco to confirm your payment of ${formatCurrency(order.total, order.currency)}.` :
                    `Scan this QR code with your mobile to confirm your payment of ${formatCurrency(order.total, order.currency)}. Our partner Crezco will redirect you to ${bankName} to do this.`
                }
              </Body> :
              <ShimmerText line={3} />
          }

          <Spacer y={3} />

          {
            isMobile ?
              <div>
                <MainButton
                  title={`Continue to ${bankName}`}
                  test-id="continue-to-bank-button"
                  onClick={handleContinueToBank}
                  disabled={!order}
                />
                <Spacer y={1} />
                <MainButton
                  title="Choose another bank"
                  onClick={handleChooseAnotherBank}
                  buttonTheme={ButtonTheme.MONOCHROME_OUTLINED}
                />
              </div> :
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
                <Spacer y={3} />
                <MainButton
                  title="I don't have my phone"
                  buttonTheme={ButtonTheme.CLEAN}
                  onClick={handleContinueToBank}
                  disabled={!order}
                />
              </div>
          }
        </div>
      </Content>
    </Container>
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
      <Container maxWidth={500}>
        {order && <CheckoutCounter order={order} / >}
        
        <Helmet>
          <title>Checkout | Mercado</title>
        </Helmet>
        <NavBar title="Checkout" back={order ? handleClickBack : null} />

        <Content>
          {!shouldEmphasiseOpenBanking && <div>
            <MainButton
              title="Pay with card"
              onClick={handlePayWithCard}
            />
            <Spacer y={1} />
            <AcceptedCards />
            <Spacer y={3} />
            <OrDivider />
            <Spacer y={3} />
          </div>}

          <Flex>
            <h2 className="header-m">Pay by bank transfer</h2>
            <FlexSpacer />
            <img src="/img/crezco.png" alt="Crezco" style={{ height: 40 }} />
          </Flex>
          <Spacer y={2} />
          <Body isFaded={true}>We'll redirect you to our payments partner Crezco to confirm the payment.</Body>
          <Spacer y={3} />
          <Flex columnGap={16}>
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
          </Flex>

          <Spacer y={3} />

          {filteredBankData.length > 0 ? 
            <div>
              {sections.map((section, index) => section.data.length > 0 && <div key={index}>
                <h2 className="header-s">{section.title}</h2>
                <Spacer y={2} />
                {section.data.map((datum) => <BankTile
                  name={datum.bankName}
                  key={datum.bankCode}
                  style={{ marginBottom: 16 }}
                  imageRef={datum.logoUrl}
                  onClick={() => handleChooseBank(datum)}
                />)}
                <Spacer y={3} />
              </div>)}
              {shouldEmphasiseOpenBanking && <div>
                <OrDivider />
                <Spacer y={3} />
                <MainButton
                  title="Pay with card"
                  onClick={handlePayWithCard}
                />
                <Spacer y={1} />
                <AcceptedCards />
              </div>}
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

              <div>
                <Body isFaded>Try searching for a different one, or pay with card instead.</Body>
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
            </div>
          }
        </Content>
      </Container>
    )
  }
}
