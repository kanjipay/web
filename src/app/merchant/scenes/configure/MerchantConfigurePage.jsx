import Spacer from "../../../../components/Spacer";
import BottomNavBar from "../../../../components/BottomNavBar";
import Switch from "@mui/material/Switch";
import Grid from "@mui/material/Grid";
import { db } from "../../../../utils/FirebaseUtils";
import {
  collection,
  doc,
  onSnapshot,
  query,
  where,
  getDocs,
  getDoc,
  orderBy,
  updateDoc,
} from "firebase/firestore";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import TextLine from "../../../../components/TextLine";
import MenuItemConfig from "./MenuItemConfig";
import MainButton from "../../../../components/MainButton";
import NavBar from "../../../../components/NavBar";

function MerchantConfigurePage(props) {
  const { merchantData, menuItems, menuSections } = props;
  const shopOpenStatusString = "Your shop is " + merchantData[0].status;
  var isConfiguredOpen = merchantData[0].status === "OPEN";
  const groupedMenuItems = {};

  menuItems.forEach((menuItem) => {
    const menuSectionId = menuItem.section_id;
    const currValue = groupedMenuItems[menuSectionId];

    if (currValue) {
      groupedMenuItems[menuSectionId].push(menuItem);
    } else {
      groupedMenuItems[menuSectionId] = [menuItem];
    }
  });

  const handleOpenToggle = () => {
    const new_status = isConfiguredOpen ? "CLOSED" : "OPEN";

    updateDoc(doc(db, "Merchant", merchantData[0].id), {
      status: new_status,
    });
  };

  return (
    <div className="container">
      <NavBar
        title={`Menu`}
        transparentDepth={0}
        opaqueDepth={0}
        showsBackButton={false}
      />
      <Spacer y={7} />
      <div className="content">
        <Spacer y={5} />
        <TextLine
          leftComponent={shopOpenStatusString}
          rightComponent={
            <Switch
              checked={isConfiguredOpen}
              onClick={(e, c) => handleOpenToggle()}
            />
          }
          spacer={0}
        />

        {menuSections.map((section) => (
          <div key={section.id}>
            <h2 className="header-m">{section.name}</h2>
            <Spacer y={2} />
            {groupedMenuItems[section.id] &&
              groupedMenuItems[section.id].map((menuItem) => (
                <span key={menuItem.id}>
                  <MenuItemConfig menuItem={menuItem} />
                  <Spacer y={3} />
                </span>
              ))}
          </div>
        ))}
                </div>
        <div className="anchored-bottom" >
        <div style={{margin:"16px"}}>
          <MainButton
            title={`Request Menu Change`}
            style={{ boxSizing: "borderBox" }}
          />
         </div>
          <Spacer y={3} />

          <BottomNavBar />
      </div>
    </div>
  );
}

export default MerchantConfigurePage;
