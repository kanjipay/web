import { useEffect, useState } from "react"
import { QrReader } from "react-qr-reader"

export default function TicketReaderPage() {
  const [data, setData] = useState("")

  const [wasAskedForCameraPermission, setWasAskedForCameraPermission] =
    useState(false)
  const [hasAllowedCamera, setHasAllowedCamera] = useState(false)

  useEffect(() => {
    if (!wasAskedForCameraPermission) {
      setWasAskedForCameraPermission(true)
      navigator.mediaDevices
        .getUserMedia({ video: true })
        .then((stream) => {
          setHasAllowedCamera(true)
        })
        .catch((error) => {
          console.log(error)
        })
    }
  }, [wasAskedForCameraPermission])

  const onResult = (result, error) => {
    if (error) {
      console.log(error)
      return
    }
    console.log(result?.text)

    setData(result?.text)
  }

  return <div>{hasAllowedCamera && <QrReader onResult={onResult} />}</div>
}
