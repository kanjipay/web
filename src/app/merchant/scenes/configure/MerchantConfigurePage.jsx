import Spacer from "../../../../components/Spacer";
import BottomNavBar from "../../../../components/BottomNavBar";
import MenuItemConfig from "./MenuItemConfig";
import Switch from '@mui/material/Switch';
import Grid from '@mui/material/Grid';
import db from '../../../../utils/services/firestore';
import { doc, updateDoc } from "firebase/firestore";
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';


function MerchantConfigurePage(props) {
  const { merchantData, menuItems } = props;
  var isConfiguredOpen = merchantData[0].status === "open";

  const handleToggle = () => {
      console.log('debugHandleToggle')
      const new_status = isConfiguredOpen ? "closed":"open";

      updateDoc(doc(db, "Merchant", merchantData[0].id), {
        status: new_status
      });
  }


    console.log('MerchantConfigurePage: menuItems', menuItems)

    console.log('MerchantConfigurePage: merchantData', merchantData)

    console.log(isConfiguredOpen)


  return (
    <div className='container'>
    <h2 className='header-m'> Menu Config Page</h2>
    <Spacer y={3} /> 
    <Grid container spacing = {2}> 
    <Grid item xs = {8}> Your shop is {merchantData[0].status} </Grid>

    <Grid item xs = {4}> 
    
        <Switch
        checked = {isConfiguredOpen}
        onClick={(e, c) => handleToggle()}
        />

    </Grid>

    </Grid>
    <Spacer y={3} />
      {menuItems.map((menuItem, index) => (
            <div key={index}>
              <MenuItemConfig></MenuItemConfig>
              <Spacer y={2} />
            </div>
      )) 
}
<div className="anchored-bottom"><BottomNavBar/></div>
    
    </div>

  );
}

export default MerchantConfigurePage;
