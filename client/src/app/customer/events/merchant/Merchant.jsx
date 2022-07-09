import { getDoc } from "firebase/firestore"
import { useEffect, useState } from "react"
import { Route, Routes, useParams } from "react-router-dom"
import LoadingPage from "../../../../components/LoadingPage"
import Collection from "../../../../enums/Collection"
import Event from "../event/Event"
import MerchantPage from "./MerchantPage"
import ReactPixel from 'react-facebook-pixel';

const metaPixelAdvancedMatching = { em: 'some@email.com' }; // todo add user details here
const metaPixelOptions = {
    autoConfig: true, // More info: https://developers.facebook.com/docs/facebook-pixel/advanced/
    debug: true, // enable logs
  };





export default function Merchant({ user }) {
  const { merchantId } = useParams()
  console.log(user)
  const [merchant, setMerchant] = useState(null)

  useEffect(() => {
    Collection.MERCHANT.onChange(merchantId, setMerchant)
  }, [merchantId])

  if (merchant) {
    console.log('here!!!!')
    const metaPixel = getDoc(Collection.MERCHANT.docRef(merchantId)).data()
    if(doc.data().metaPixel){
      console.log('pixelid',doc.data().metaPixel)
      ReactPixel.init(doc.data().metaPixel, metaPixelAdvancedMatching, metaPixelOptions) // todo make this different
      console.log('here!');
      ReactPixel.pageView();
    }
  }
    return (
      <Routes>
        <Route
          path=":eventId/*"
          element={<Event merchant={merchant} user={user} />}
        />
        <Route path="/" element={<MerchantPage merchant={merchant} />} />
      </Routes>
    )
  } else {
    return <LoadingPage />
  }
}
