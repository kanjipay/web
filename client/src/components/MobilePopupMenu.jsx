import { useNavigate } from "react-router-dom";
import Popup from "reactjs-popup";
import Cross from "../assets/icons/Cross";
import Menu from "../assets/icons/Menu";
import { Colors } from "../enums/Colors";
import { ButtonTheme } from "./ButtonTheme";
import IconButton from "./IconButton";

export default function MobilePopupMenu({ navItems = [], buttonTheme = ButtonTheme.MONOCHROME }) {
  const navigate = useNavigate()
  return <Popup
    trigger={<IconButton
      Icon={Menu}
      buttonTheme={buttonTheme}
    />}
    closeOnDocumentClick
    modal
    arrow={false}
    contentStyle={{
      backgroundColor: Colors.WHITE,
      width: "100vw",
      maxWidth: "600px",
      // transform: "translate(50%, 0)",
      height: "100vh"
    }}
  >
    {
      close => {
        return <div>
          <div style={{ 
            display: "flex", 
            alignItems: "center", 
            padding: "0 8px 0 8px", 
            height: 48,
            boxSizing: "border-box", 
            backgroundColor: Colors.WHITE,
            borderBottom: `2px solid ${Colors.OFF_WHITE}`,
            position: "relative"
          }}>
            <div className="flex-spacer"></div>
            <div style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              color: Colors.BLACK,
              fontWeight: 500
            }}>Menu</div>
            <IconButton Icon={Cross} onClick={close} buttonTheme={ButtonTheme.MONOCHROME_REVERSED} />
          </div>
          {
            navItems.map(item => {
              return <div
                style={{
                  borderBottom: `1px solid ${Colors.OFF_WHITE}`,
                  textAlign: "center",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: "100%",
                  padding: 16,
                  boxSizing: "border-box",
                  color: Colors.BLACK,
                  cursor: "pointer"
                }}
                onClick={() => {
                  const { action, path } = item

                  if (action) {
                    action()
                  } else if (path) {
                    navigate(item.path)
                  }

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