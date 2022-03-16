import { useParams } from "react-router-dom";
import NavBar from "../../../../components/NavBar";
import Spacer from "../../../../components/Spacer";
import AsyncImage from "../../../../components/AsyncImage";
import { Helmet } from "react-helmet-async";
import { getMenuItemStorageRef } from "../../../../utils/helpers/storage";
import Details from "../../../../assets/icons/Details";
import TextLine from "../../../../components/TextLine";
import MainButton from "../../../../components/MainButton";
import CircleIcon from "../../../../components/CircleIcon";
import "./MenuItemConfigPage.css";
import DietaryAttribute from "../../../checkout/menu/DietaryAttribute";
import { formatCurrency } from "../../../../utils/helpers/money";
import { Colors } from "../../../../components/CircleButton";

// TODO DietaryAttribute should be a common component
// TODO Better way of filtering local data

function MenuItemConfigPage(props) {
  const { menuItems, menuSections } = props;
  const { menuItemId } = useParams();
  const filteredMenuItems = menuItems.filter((item) => item.id === menuItemId);
  const menuItem = filteredMenuItems[0];
  const filteredSections = menuSections.filter(
    (secion) => secion.id === menuItem.section_id
  );
  const section = filteredSections[0];
  const dietaryBubbles = [];

  for (var attr of DietaryAttribute.allItems) {
    if (menuItem.dietary_attributes.includes(attr.name)) {
      dietaryBubbles.push(
        <div
          key={attr.name}
          className="bubble"
          style={{
            color: attr.foregroundColor,
            backgroundColor: attr.backgroundColor,
          }}
        >
          {attr.displayNameLong}
        </div>
      );
    }
  }

  return (
    <div className="container">
      <Helmet>
        <title>{menuItem.title}</title>
      </Helmet>
      <NavBar
        title={menuItem.title}
        transparentDepth={50}
        opaqueDepth={100}
        showsBackButton={true}
      />
      <AsyncImage
        imageRef={getMenuItemStorageRef(
          menuItem.merchant_id,
          menuItemId,
          menuItem.photo
        )}
        className="headerImage"
        alt={menuItem.title}
      />
      <div className="content">
        <Spacer y={3} />
        <h1 className="header-l">{menuItem.title}</h1>
        <Spacer y={3} />

        <div style={{ display: "flex", alignItems: "center" }}>
          <CircleIcon Icon={Details} style={{ marginRight: 8 }} />
          <div className="header-s">Details</div>
        </div>
        <Spacer y={2} />
        <TextLine leftComponent="Title" rightComponent={menuItem.title} />
        <TextLine
          leftComponent="Description"
          rightComponent={menuItem.description}
        />
        <TextLine
          leftComponent="Price"
          rightComponent={formatCurrency(menuItem.price)}
        />
        <TextLine
          leftComponent="Spice Level"
          rightComponent={menuItem.spice_level}
        />
        <TextLine leftComponent="Section" rightComponent={section.name} />

        <Spacer y={3} />
        <div style={{ display: "flex", alignItems: "center" }}>
          <CircleIcon Icon={Details} style={{ marginRight: 8 }} />
          <div className="header-s">Dietary Information</div>
        </div>
        <Spacer y={2} />
        <div className="grid">{dietaryBubbles}</div>
        <Spacer y={4} />
      </div>
      <Spacer y={10} />

      <div
        className="anchored-bottom"
        style={{ backgroundColor: Colors.WHITE }}
      >
        <div style={{ margin: "16px" }}>
          <MainButton title={`Request Menu Change`} />
        </div>
        <Spacer y={2} />
      </div>
    </div>
  );
}

export default MenuItemConfigPage;
