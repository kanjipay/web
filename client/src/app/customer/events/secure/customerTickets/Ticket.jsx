import { display } from "@mui/system";
import QRCode from "react-qr-code";
import { Colors } from "../../../../../components/CircleButton";
import Spacer from "../../../../../components/Spacer";
import { format } from "date-fns"
import { dateFromTimestamp } from "../../../../../utils/helpers/time";
import useWindowSize from "../../../../../utils/helpers/useWindowSize";

export default function Ticket({ ticket, product, index }) {
  let indexString = index.toString()
  const { width } = useWindowSize()
  const isMobile = width < 750

  while (indexString.length < 3) {
    indexString = "0" + indexString
  }
  return <div style={{ 
    padding: 32,
    backgroundColor: Colors.OFF_WHITE_LIGHT,
    display: "grid", 
    gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
    position: "relative"
  }}>
    <QRCode size={200} style={{ flexShrink: 0 }} value={ticket.id} bgColor={Colors.CLEAR} fgColor={Colors.BLACK} />
    <div style={{ flexGrow: 100 }}>
      { isMobile && <Spacer y={3} />}
      <h3 className="header-s" style={{ lineHeight: 1 }}>{product.title}</h3>
      <Spacer y={3} />
      <div style={{ display: "flex", columnGap: 8 }}>
        <h4 className="header-xs" style={{ lineHeight: 1 }}>Bought:</h4>
        <p style={{
          fontFamily: "Roboto Mono, Roboto, sans-serif",
          lineHeight: 1
        }}>{format(dateFromTimestamp(ticket.createdAt), "HH:mm dd-MM-yy")}</p>
      </div>

      <Spacer y={3} />

      <h4 className="header-xs" style={{ lineHeight: 1 }}>Ticket ID:</h4>
      <Spacer y={1} />
      <p style={{
        fontFamily: "Roboto Mono, Roboto, sans-serif",
      }}>{ticket.id}</p>
      <Spacer y={3} />
      <p style={{
        fontFamily: "Roboto Mono, Roboto, sans-serif",
        fontSize: "0.8em",
        display: "inline-block",
        backgroundColor: Colors.BLACK,
        color: Colors.WHITE,
        padding: "2px 6px"
      }}>{indexString}</p>
      
    </div>
    
    
  </div>
}