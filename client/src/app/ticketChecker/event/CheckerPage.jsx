import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import Cross from "../../../assets/icons/Cross"
import Tick from "../../../assets/icons/Tick"
import IconActionPage from "../../../components/IconActionPage"
import { Colors } from "../../../enums/Colors"
import { NetworkManager } from "../../../utils/NetworkManager"
import TicketCheckerNavBar from "../TicketCheckerNavBar"
import { QrReader } from 'react-qr-reader';
import Settings from "../../../assets/icons/Settings"
import LoadingPage from "../../../components/LoadingPage"
import IconPage from "../../../components/IconPage"
import Discover from "../../../assets/icons/Discover"

class PermissionStatus {
  static GRANTED = "GRANTED"
  static NOT_GRANTED = "NOT_GRANTED"
  static DECLINED = "DECLINED"
  static DEVICE_NOT_PRESENT = "DEVICE_NOT_PRESENT"
}

class DeviceType {
  static CAMERA = "videoinput"
  static MICROPHONE = "audioinput"
}

function isBackFacingCameraPresent(stream) {
  return true // the below doesn't work
  console.log(stream.getTracks())
  return stream.getTracks()[0].getCapabilities()?.facingMode?.[0] === "environment"
}

async function getPermissionStatus(deviceType) {
  const allDevices = await navigator.mediaDevices.enumerateDevices()

  const devices = allDevices.filter(device => device.kind === deviceType)

  if (devices.length === 0) {
    return PermissionStatus.DEVICE_NOT_PRESENT
  } else if (devices[0].label === "") {
    return PermissionStatus.NOT_GRANTED
  } else {
    return PermissionStatus.GRANTED
  }
}

export default function CheckerPage({ event }) {
  const { merchantId, eventId } = useParams()
  const [scanData, setScanData] = useState(null)
  const [ticketId, setTicketId] = useState(null)
  const [cameraPermissionStatus, setCameraPermissionStatus] = useState(null)

  const handleResetScanner = () => {
    setScanData(null)
    setTicketId(null)
  }

  const handleGiveCameraPermission = () => {
    navigator.mediaDevices.getUserMedia({ video: true, audio: false })
      .then(stream => {
        const status = isBackFacingCameraPresent(stream) ? PermissionStatus.GRANTED : PermissionStatus.DEVICE_NOT_PRESENT
        setCameraPermissionStatus(status)
      })
      .catch(error => {
        console.log(error)
        setCameraPermissionStatus(PermissionStatus.DECLINED)
      })
  }

  useEffect(() => {
    getPermissionStatus(DeviceType.CAMERA).then(status => {
      if (status === PermissionStatus.GRANTED) {
        navigator.mediaDevices.getUserMedia({ video: true, audio: false })
          .then(stream => {
            setCameraPermissionStatus(isBackFacingCameraPresent(stream) ? PermissionStatus.GRANTED : PermissionStatus.DEVICE_NOT_PRESENT)
          })
      } else {
        setCameraPermissionStatus(status)
      }
    })
  }, [])

  const onResult = (result, error) => {
    if (error) {
      console.log(error)
      return
    }

    if (result) {
      console.log("ticketId: ", result)

      if (result !== ticketId) {
        setTicketId(result)
      }
      
      return
    }
  }

  useEffect(() => {
    if (!merchantId || !eventId || !ticketId) { return }

    NetworkManager.post(`/merchants/m/${merchantId}/tickets/${ticketId}/check`, { eventId })
      .then(res => {
        const { product, user } = res.data
        const { firstName, lastName } = user
        const { title: productTitle } = product
        const body = `${productTitle} ticket bought by ${firstName} ${lastName}.`

        setScanData({
          isSuccessful: true,
          title: "Valid ticket",
          body
        })
      })
      .catch(err => {
        setScanData({
          isSuccessful: false,
          title: "Invalid ticket",
          body: err.response?.data?.message
        })
      })
  }, [ticketId, merchantId, eventId])

  if (scanData) {
    const { isSuccessful, title, body } = scanData

    return <IconActionPage
      Icon={isSuccessful ? Tick : Cross}
      iconBackgroundColor={isSuccessful ? Colors.OFF_WHITE_LIGHT : Colors.RED_LIGHT}
      iconForegroundColor={isSuccessful ? Colors.BLACK : Colors.RED}
      title={title}
      body={body}
      primaryActionTitle="Scan another ticket"
      primaryAction={handleResetScanner}
    />
  } else if (ticketId) {
    return <LoadingPage message="Checking ticket" />
  } else {
    switch (cameraPermissionStatus) {
      case PermissionStatus.GRANTED:
        return <div className="container">
          <TicketCheckerNavBar
            title="Scan tickets"
            backPath="../.."
          />
          <div className="content" style={{ padding: 0 }}>
            <QrReader
              constraints={{
                facingMode: "environment"
              }}
              containerStyle={{
                height: "calc(100vh - 48px)",
                overflow: "hidden",
                marginTop: 48,
              }}
              videoContainerStyle={{
                paddingTop: "calc(100vh - 48px)",
              }}
              videoStyle={{
                objectFit: "fill",
              }}
              onResult={onResult}
            />
          </div>
        </div>
      case PermissionStatus.NOT_GRANTED:
        return <IconActionPage
          Icon={Settings}
          iconBackgroundColor={Colors.OFF_WHITE_LIGHT}
          iconForegroundColor={Colors.BLACK}
          title="Camera permission required"
          body="To scan tickets, we need permission to use your device's camera."
          primaryActionTitle="Give permission"
          primaryAction={handleGiveCameraPermission}
        />
      case PermissionStatus.DEVICE_NOT_PRESENT:
        return <IconPage
          Icon={Discover}
          iconBackgroundColor={Colors.OFF_WHITE_LIGHT}
          iconForegroundColor={Colors.BLACK}
          title="Unable to scan"
          body="We couldn't detect a back facing camera on your device."
        />
      case PermissionStatus.DECLINED:
        return <IconPage
          Icon={Discover}
          iconBackgroundColor={Colors.OFF_WHITE_LIGHT}
          iconForegroundColor={Colors.BLACK}
          title="Unable to scan"
          body="You declined camera permissions."
        />
      default:
        return <LoadingPage />
    }
    
  }
  
  
}