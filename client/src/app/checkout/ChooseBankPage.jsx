import axios from "axios";
import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { useNavigate } from "react-router-dom";
import Discover from "../../assets/icons/Discover";
import { Colors } from "../../components/CircleButton";
import CircleIcon from "../../components/CircleIcon";
import LoadingPage from "../../components/LoadingPage";
import NavBar from "../../components/NavBar";
import Spacer from "../../components/Spacer";
import OrderStatus from "../../enums/OrderStatus";
import { setOrderStatus } from "../../utils/services/OrdersService";
import BankTile from "./BankTile";

async function fetchBankData() {
  const res = await axios.get("https://identity.moneyhub.co.uk/oidc/.well-known/api-connections")

  return res.data.filter(datum => {
    return (
      datum.country === 'GB' &&
      !datum.isBeta &&
      datum.accountTypes.some(accountType => accountType.name === "cash") &&
      datum.status.sync === 'AVAILABLE' &&
      datum.status.auth === 'AVAILABLE' &&
      datum.userTypes.includes('personal')
    )
  })
}

export async function fetchBankDatum(bankId) {
  const bankData = await fetchBankData()
  return bankData.find(datum => datum.id === bankId)
}

export default function ChooseBankPage({ order }) {
  const [bankName, setBankName] = useState("")
  const [bankData, setBankData] = useState([])
  const [filteredBankData, setFilteredBankData] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  const navigate = useNavigate()

  useEffect(() => {
    const bankId = localStorage.getItem("moneyhubBankId")

    if (bankId) {
      navigate(`../confirm-bank/${bankId}`)
    } else {
      fetchBankData().then(bankData => {
        setBankData(bankData)
        setFilteredBankData(bankData)
        setIsLoading(false)
      })
    }
  }, [navigate])

  const handleBankNameChange = (event) => {
    const enteredBankName = event.target.value
    setBankName(enteredBankName)

    if (enteredBankName.length >= 2) {
      const filteredData = bankData.filter(datum => {
        return datum.name.replace(" Open Banking", "").toLowerCase().includes(enteredBankName.toLowerCase()) 
      })

      setFilteredBankData(filteredData)
    } else {
      setFilteredBankData(bankData)
    }
  }

  const handleChooseBank = (bankDatum) => {
    localStorage.setItem("moneyhubBankId", bankDatum.id)
    navigate("../confirm-bank", { state: { bankDatum } })
  }

  const handleClickBack = () => {
    setIsLoading(true)

    setOrderStatus(order.id, OrderStatus.ABANDONED).then(() => {
      navigate(`/menu/${order.merchantId}`)
      setIsLoading(false)
    })
  }

  return isLoading ? 
  <LoadingPage /> :
  <div className="container">
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
          borderRadius: 16, 
          height: 48, 
          padding: "0 16px 0 8px",
          backgroundColor: Colors.OFF_WHITE_LIGHT,
          overflow: "hidden",
          columnGap: 8
        }}>
          <Discover length={32} color={Colors.GRAY_LIGHT} />
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
              filteredBankData.map(datum => <BankTile key={datum.id} bankDatum={datum} onClick={() => handleChooseBank(datum)} />)
            }
          </div> :
          <div style={{ textAlign: "center" }}>
            <CircleIcon 
              Icon={Discover} 
              style={{ margin: "auto" }}
              length={120} 
              backgroundColor={Colors.PRIMARY_LIGHT} 
              foregroundColor={Colors.PRIMARY}
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