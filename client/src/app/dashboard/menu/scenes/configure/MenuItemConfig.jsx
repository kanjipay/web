import AsyncImage from "../../../../../components/AsyncImage";
import { getMenuItemStorageRef } from "../../../../../utils/helpers/storage";
import "./MenuItemConfig.css";
import Switch from "@mui/material/Switch";
import Spacer from "../../../../../components/Spacer";
import { Link } from "react-router-dom";
import { setMenuItemAvailability } from "../../../../../utils/services/MerchantService";

function MenuItemConfig(props) {
  const { menuItem } = props;

  const handleItemToggle = () => {
    const newAvailability = !menuItem.isAvailable;
    setMenuItemAvailability(menuItem.id, newAvailability);
  };

  return (
    <div className="MenuItemConfig__flexContainer">
      <div className="MenuItemConfig__menuItemPictureContainer">
        <Link to={`item/${menuItem.id}`}>
          <AsyncImage
            imageRef={getMenuItemStorageRef(
              menuItem.merchantId,
              menuItem.id,
              menuItem.photo
            )}
            className="MenuItemConfig__menuItemPicture"
            alt={menuItem.title}
          />
        </Link>
      </div>
      <div className="menuItemConfig__textContainer">
        <Link to={`item/${menuItem.id}`}>
          <div className="header-xs">{menuItem.title}</div>
          <Spacer y={1} />
          <div className="text-body-faded">
            {menuItem.isAvailable ? "Available" : "Not Available"}
          </div>
        </Link>
      </div>
      <div className="flex-spacer" />
      <div className="menuItemConfig__switchContainer">
        <Switch
          checked={menuItem.isAvailable}
          onClick={(e, c) => handleItemToggle()}
        />
      </div>
    </div>
  );
}

export default MenuItemConfig;
