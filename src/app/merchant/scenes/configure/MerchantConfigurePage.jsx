import Spacer from "../../../../components/Spacer";
import BottomNavBar from "../../../../components/BottomNavBar";
import Switch from '@mui/material/Switch';
import Grid from '@mui/material/Grid';
import { db } from '../../../../utils/FirebaseUtils';
import { collection, doc, onSnapshot, query, where, getDocs, getDoc, orderBy, updateDoc } from "firebase/firestore";
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import TextLine from "../../../../components/TextLine";
import MenuItemConfig from "./MenuItemConfig";
import MainButton from "../../../../components/MainButton";


function MerchantConfigurePage(props) {
  const { merchantData, menuItems, menuSections } = props;
  const shopOpenStatusString = "Your shop is " + merchantData[0].status
  var isConfiguredOpen = merchantData[0].status === "open";
  const groupedMenuItems = {}

  menuItems.forEach(menuItem => {
    const menuSectionId = menuItem.section_id
    const currValue = groupedMenuItems[menuSectionId]

    if (currValue) {
      groupedMenuItems[menuSectionId].push(menuItem)
    } else {
      groupedMenuItems[menuSectionId] = [menuItem]
    }
  })

  const handleOpenToggle = () => {
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
             <div className="content">
    <h2 className='header-m'> Menu Config Page</h2>
    <Spacer y={5} /> 
    <TextLine leftComponent={shopOpenStatusString} rightComponent = {<Switch
        checked = {isConfiguredOpen}
        onClick={(e, c) => handleOpenToggle()}
        />} spacer={0} />

    {
          menuSections.map(section => (
            <div key={section.id}>
              <h2 className='header-m'>{section.name}</h2>
              <Spacer y={2} />
              {
                groupedMenuItems[section.id] &&
                  groupedMenuItems[section.id].map(menuItem => (
                    <span key={menuItem.id}>
                      <MenuItemConfig menuItem={menuItem} />
                      <Spacer y={3} />
                    </span>
                ))
              }
            </div>
          ))
        }
<div className="anchored-bottom">
<MainButton
                      title={`Request Menu Change`}
                      style={{ boxSizing: "borderBox" }}
                  />
                  <Spacer y={3}/>

    <BottomNavBar/></div>
    
    </div>
    </div>

  );
}

export default MerchantConfigurePage;
