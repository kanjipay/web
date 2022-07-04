import { useState } from "react"
import BottomNavigation from "@mui/material/BottomNavigation"
import BottomNavigationAction from "@mui/material/BottomNavigationAction"
import ManageAccountsOutlinedIcon from "@mui/icons-material/ManageAccountsOutlined"
import ListAltOutlinedIcon from "@mui/icons-material/ListAltOutlined"
import ChatBubbleOutlineOutlinedIcon from "@mui/icons-material/ChatBubbleOutlineOutlined"
import { Link } from "react-router-dom"
import "./BottomNavBar.css"

// TODO Make the Orders Icon have a badge based on number of outstanding order (see https://mui.com/components/badges/)
// TODO Make this function configurable for downstream users

export default function BottomNavBar() {
  const [value, setValue] = useState(0)
  const handleChange = (event, newValue) => {
    setValue(newValue)
  }

  return (
    <div className="NavBar__outerContainer">
      <BottomNavigation showLabels value={value} onChange={handleChange}>
        <BottomNavigationAction
          className="NavBar__button"
          component={Link}
          to="/merchant/dashboard"
          label="Orders"
          icon={<ChatBubbleOutlineOutlinedIcon />}
        />
        <BottomNavigationAction
          className="NavBar__button"
          component={Link}
          to="/merchant/configure"
          label="Configure Menu"
          icon={<ListAltOutlinedIcon />}
        />
        <BottomNavigationAction
          className="NavBar__button"
          component={Link}
          to="/merchant/account"
          label="Account"
          icon={<ManageAccountsOutlinedIcon />}
        />
      </BottomNavigation>
    </div>
  )
}
