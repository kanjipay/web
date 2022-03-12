import { useState } from 'react';
import Box from '@mui/material/Box';
import BottomNavigation from '@mui/material/BottomNavigation';
import BottomNavigationAction from '@mui/material/BottomNavigationAction';
import ManageAccountsOutlinedIcon from '@mui/icons-material/ManageAccountsOutlined';
import ListAltOutlinedIcon from '@mui/icons-material/ListAltOutlined';
import ChatBubbleOutlineOutlinedIcon from '@mui/icons-material/ChatBubbleOutlineOutlined';
import { Link } from 'react-router-dom';

// TODO Make the Orders Icon have a badge based on number of outstanding order (see https://mui.com/components/badges/)
// TODO Make this function configurable for downstream users

export default function BottomNavBar() {
    const [value, setValue] = useState(0);
    const handleChange = (event, newValue) => {
        setValue(newValue);
      };
  
    return (
      <Box sx={{ width: 500 }}>
        <BottomNavigation
          showLabels
          value={value}
          onChange={handleChange}
        >
          <BottomNavigationAction component = {Link} to = "/merchant/dashboard" label="Orders"  icon={<ChatBubbleOutlineOutlinedIcon />} />
          <BottomNavigationAction component = {Link} to = "/merchant/configure" label="Configure Menu" icon={<ListAltOutlinedIcon />} />
          <BottomNavigationAction component = {Link} to = "/merchant/account" label="Account" icon={<ManageAccountsOutlinedIcon />} />
        </BottomNavigation>
      </Box>
    );
  }