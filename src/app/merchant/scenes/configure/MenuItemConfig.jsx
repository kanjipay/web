import AsyncImage from "../../../../components/AsyncImage";
import { getMenuItemStorageRef } from "../../../../utils/helpers/storage";
import "./MenuItemConfig.css";
import Grid from "@mui/material/Grid";
import Switch from "@mui/material/Switch";
import Spacer from "../../../../components/Spacer";
import { Link } from "react-router-dom";
import { setMenuItemAvailability } from "../../../../utils/services/MerchantService";

function MenuItemConfig(props) {
  const { menuItem } = props;

  const handleItemToggle = () => {
    const newAvailability = !menuItem.is_available;
    setMenuItemAvailability(menuItem.id, newAvailability);
  };

  return (
    <Grid container spacing={2}>
      <Grid item xs={10}>
        <Link to={`item/${menuItem.id}`}>
          <Grid container spacing={0}>
            <Grid item xs={2.5}>
              <AsyncImage
                imageRef={getMenuItemStorageRef(
                  menuItem.merchant_id,
                  menuItem.id,
                  menuItem.photo
                )}
                className="MenuItemConfig__menuItemPicture"
                alt={menuItem.title}
              />
            </Grid>
            <Grid item xs={9}>
              <div className="header-xs">{menuItem.title}</div>
              <Spacer y={1} />
              <div className="text-body-faded">
                {menuItem.is_available ? "Available" : "Not Available"}
              </div>
            </Grid>
          </Grid>
        </Link>
      </Grid>
      <Grid item xs={2}>
        <div className="MenuItemConfig__menuItemToggle">
          <Switch
            checked={menuItem.is_available}
            onClick={(e, c) => handleItemToggle()}
          />
        </div>
      </Grid>
    </Grid>
  );
}

export default MenuItemConfig;
