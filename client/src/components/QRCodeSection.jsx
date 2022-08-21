import { isMobile } from "react-device-detect"
import QRCode from "react-qr-code"
import { Colors } from "../enums/Colors"
import { ImageFormat } from "../enums/ImageFormat"
import Dropdown from "./input/Dropdown"
import { Field, FieldDecorator } from "./input/IntField"
import MainButton from "./MainButton"
import Spacer from "./Spacer"
import { Canvg } from "canvg"
import { useState } from "react"

export default function QRCodeSection({ title, body, value }) {
  const initialQrColor = localStorage.getItem("qrQrColor") ?? Colors.BLACK.toUpperCase()
  const [qrColor, setForegroundColor] = useState(initialQrColor.replace("#", ""))
  const [displayQrColor, setDisplayForegroundColor] = useState(initialQrColor)
  const [qrImageFormat, setQrImageFormat] = useState(ImageFormat.PNG)

  const updateForegroundColor = event => {
    const { value } = event.target
    setForegroundColor(value)

    if (/[0-9a-fA-F]{6}/g.test(value) || /[0-9a-fA-F]{3}/g.test(value)) {
      setDisplayForegroundColor("#" + value)
    }
  }

  const handleDownloadQrCode = () => {
    const svg = document.querySelector("#event-link-qr-code")
    const filename = `qr-code-event-link.${qrImageFormat.toLowerCase()}`

    let fileUrl

    switch (qrImageFormat) {
      case ImageFormat.SVG:
        const blob = new Blob([svg.outerHTML], { type: "image/svg+xml" });
        fileUrl = URL.createObjectURL(blob);
        break
      case ImageFormat.PNG:
        const data = (new XMLSerializer()).serializeToString(svg)
        const canvas = document.createElement("canvas")
        const ctx = canvas.getContext('2d')
        const canvg = Canvg.fromString(ctx, data)

        canvg.start()

        fileUrl = canvas.toDataURL("image/png");
        break
      default:
    }

    const link = document.createElement("a");
    link.href = fileUrl;
    link.download = filename
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setTimeout(() => URL.revokeObjectURL(fileUrl), 5000);
  }

  return <div>
    <h3 className="header-s">{title}</h3>

    <Spacer y={3} />
    <p className="text-body-faded">{body}</p>
    <Spacer y={3} />
    <div style={{
      display: isMobile ? "block" : "flex",
      columnGap: 24
    }}>
      <QRCode
        size={200}
        style={{ flexShrink: 0 }}
        value={value}
        id="event-link-qr-code"
        fgColor={displayQrColor}
        bgColor={Colors.CLEAR}
      />


      {isMobile && <Spacer y={3} />}

      <div style={{ flexGrow: 100, flexShrink: 100 }}>
        <div style={{ display: "flex", alignItems: "center" }}>
          <p
            className="text-body"
            style={{ width: 80, flexShrink: 0 }}
          >
            Color
          </p>
          <FieldDecorator
            style={{ flexGrow: 100, width: "auto" }}
            field={
              <Field
                value={qrColor}
                onChange={updateForegroundColor}
                maxChars={6}
              />
            }
            prefix="#"
          />
        </div>

        <Spacer y={2} />
        <div style={{ display: "flex", alignItems: "center" }}>
          <p
            className="text-body"
            style={{ width: 80 }}
          >
            Export as
          </p>
          <Dropdown
            style={{ flexGrow: 100, width: "auto" }}
            optionList={[
              { value: ImageFormat.PNG },
              { value: ImageFormat.SVG },
            ]}
            value={qrImageFormat}
            onChange={event => setQrImageFormat(event.target.value)}
          />
        </div>

        <Spacer y={2} />
        <MainButton
          title="Download QR code"
          onClick={handleDownloadQrCode}
        />
      </div>
    </div>
  </div>
}