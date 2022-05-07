import QRCode from "react-qr-code";
import { Colors } from "../../../../../components/CircleButton";

export default function Ticket({ ticket }) {
  return <div style={{ 
    width: "100%", 
    height: 320, 
    border: `2px solid ${Colors.OFF_WHITE}`, 
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
    display: "flex"
  }}>
    <QRCode size={160} value={ticket.id}/>
  </div>
}