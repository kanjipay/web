import { onSnapshot } from "firebase/firestore";
import { useEffect, useState } from "react";
import { Route, Routes, useParams } from "react-router-dom";
import Carat from "../../../assets/icons/Carat";
import Spinner from "../../../assets/Spinner";
import { Colors } from "../../../components/CircleButton";
import Spacer from "../../../components/Spacer";
import Collection from "../../../enums/Collection";
import RegisteredConfirm from "../RegisteredConfirm";

export default function Merchant() {
  const { merchantId } = useParams()

  const [isLoading, setIsLoading] = useState(true)
  const [merchant, setMerchant] = useState(null)

  useEffect(() => {
    onSnapshot(Collection.MERCHANT.docRef(merchantId), doc => {
      setIsLoading(false)
      const merchant = { id: doc.id, ...doc.data() }
      setMerchant(merchant)
    })
  }, [merchantId])

  if (isLoading) {
    return <div style={{ height: "100vh", position: "relative" }}>
      <div className="centred">
        <Spinner />
      </div>
    </div>
  } else if (merchant) {
    return <div style={{ minHeight: "100vh", position: "relative", display: "flex" }}>
      <div style={{ width: 256, backgroundColor: Colors.OFF_WHITE_LIGHT }}>

      </div>
      <div className="flex-spacer" style={{ padding: "0 24px"}}>
        <Spacer y={12} />
        <Routes>
          <Route path="confirm-crezco" element={<RegisteredConfirm />} />
        </Routes>
        

      </div>
    </div>
  } else {
    return <div>Error</div>
  }
}