import { Colors } from "../enums/Colors";
import { useState } from "react"
import Spacer from "./Spacer";

function Tab({ isSelectedTab, title, style, ...props }) {
  const [isHovering, setIsHovering] = useState(false)

  return <div
    onMouseEnter={() => setIsHovering(true)}
    onMouseLeave={() => setIsHovering(false)}
    style={{
      display: "flex",
      alignItems: "center",
      padding: "0 16px",
      height: 48,
      whiteSpace: "nowrap",
      justifyContent: "center",
      backgroundColor: isSelectedTab ?
        (isHovering ? Colors.OFF_BLACK_LIGHT : Colors.BLACK) :
        (isHovering ? Colors.OFF_WHITE : Colors.OFF_WHITE_LIGHT),
      color: isSelectedTab ?
        Colors.WHITE :
        Colors.BLACK,
      cursor: "pointer",
      ...style
    }}
    {...props}
  >
    {title}
  </div>
}

export default function TabControl({ name, tabs }) {
  const tabNames = Object.keys(tabs)
  const sessionStorageKey = `${name}-selected-tab`
  const initialSelectedTabName = sessionStorage.getItem(sessionStorageKey) ?? tabNames[0]
  const [selectedTabName, setSelectedTabName] = useState(initialSelectedTabName)

  return <div>
    <div style={{
      display: "flex",
      borderBottom: `2px solid ${Colors.OFF_WHITE}`,
      overflow: "scroll",
      width: "100%",
      height: 48,
      columnGap: 8
    }}>
      {
        tabNames.map((tabName, index) => {
          return <Tab
            key={index}
            isSelectedTab={tabName === selectedTabName}
            onClick={() => {
              sessionStorage.setItem(sessionStorageKey, tabName)

              // This is so there is no odd caching of tabs
              setSelectedTabName(null)

              setTimeout(() => {
                setSelectedTabName(tabName)
              }, 5)
            }}
            title={tabName}
          />
        })
      }
    </div>
    <Spacer y={3} />
    {selectedTabName ? tabs[selectedTabName] : <div></div>}
  </div>
}