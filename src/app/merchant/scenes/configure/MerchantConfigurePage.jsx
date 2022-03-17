import Spacer from "../../../../components/Spacer";
import BottomNavBar from "../../../../components/BottomNavBar";
import Switch from "@mui/material/Switch";
import TextLine from "../../../../components/TextLine";
import MenuItemConfig from "./MenuItemConfig";
import MainButton from "../../../../components/MainButton";
import NavBar from "../../../../components/NavBar";
import { setMerchantStatus } from "../../../../utils/services/MerchantService";
import "./MerchantConfigurePage.css";

function MerchantConfigurePage(props) {
  const { merchantData, menuItems, menuSections } = props;
  const shopOpenStatusString = "Your shop is " + merchantData.status;
  var isConfiguredOpen = merchantData.status === "OPEN";

  //Create grouped menu items array to display correctly
  const groupedMenuItems = {};

  menuItems.forEach((menuItem) => {
    const menuSectionId = menuItem.sectionId;
    const currValue = groupedMenuItems[menuSectionId];

    if (currValue) {
      groupedMenuItems[menuSectionId].push(menuItem);
    } else {
      groupedMenuItems[menuSectionId] = [menuItem];
    }
  });

  const handleOpenToggle = () => {
    const newStatus = isConfiguredOpen ? "CLOSED" : "OPEN";

    setMerchantStatus(merchantData.id, newStatus);
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
      <div className="anchored-bottom">
        <div style={{ margin: "16px" }}>
          <MainButton
            title={`Request Menu Change`}
            style={{ boxSizing: "borderBox" }}
          />
        </div>
        <BottomNavBar />
      </div>
    </div>
  );
}

export default MerchantConfigurePage;
