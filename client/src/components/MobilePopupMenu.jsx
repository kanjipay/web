import { Link, useNavigate } from "react-router-dom";
import Popup from "reactjs-popup";
import Cross from "../assets/icons/Cross";
import Menu from "../assets/icons/Menu";
import { Colors } from "../enums/Colors";
import { ButtonTheme } from "./ButtonTheme";
import IconButton from "./IconButton";

export default function MobilePopupMenu({ navItems = [] }) {
  const navigate = useNavigate()
  return <Popup
    trigger={<IconButton
      Icon={Menu}
      buttonTheme={ButtonTheme.MONOCHROME}
    />}
    closeOnDocumentClick
    modal
    arrow={false}
    contentStyle={{
      backgroundColor: Colors.OFF_BLACK,
      width: "100vw",
      height: "100vh"
    }}
  >
    {
      close => {
        return <div>
          <div style={{ 
            display: "flex", 
            alignItems: "center", 
            padding: "0 16px", 
            height: 48,
            boxSizing: "border-box", 
            backgroundColor: Colors.BLACK,
            position: "relative"
          }}>
            <div className="flex-spacer"></div>
            <div style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              color: Colors.WHITE,
              fontWeight: 500
            }}>Menu</div>
            <IconButton Icon={Cross} onClick={close} />
          </div>
          {
            navItems.map(item => {
              return <div
                to={item.path} 
                style={{
                  borderBottom: `1px solid ${Colors.OFF_BLACK_LIGHT}`,
                  textAlign: "center",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: "100%",
                  padding: 16,
                  boxSizing: "border-box",
                  color: Colors.WHITE,
                }}
                onClick={() => {
                  navigate(item.path)
                  close()
                }}
              >
                {item.title}
              </div>
            })
          }
        </div>
      }
    }
  </Popup>
}