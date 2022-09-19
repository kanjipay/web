import { useRef } from "react";
import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import TawkMessengerReact from '@tawk.to/tawk-messenger-react';
import { useState } from "react";

export default function Tawk() {
  const location = useLocation()
  const chatRef = useRef()
  const tawkData = JSON.parse(process.env.REACT_APP_TAWK)
  const [hasLoaded, setHasLoaded] = useState(false)

  useEffect(() => {
    if (!hasLoaded || !chatRef.current) { return }

    const shouldShow = ["/", "/pricing", "/faqs"].includes(location.pathname)

    try {
      if (shouldShow) {
        chatRef.current?.showWidget()
      } else {
        chatRef.current?.hideWidget()
      }
    } catch (err) {
      console.log(err)
    }
    
  }, [location, hasLoaded])

  return <TawkMessengerReact
    ref={chatRef}
    propertyId={tawkData.propertyId}
    widgetId={tawkData.widgetId}
    onLoad={() => setHasLoaded(true)}
  />
}