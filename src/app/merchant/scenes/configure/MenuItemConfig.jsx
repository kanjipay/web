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
    <div className="flex-spacer"/>
    <div className="menuItemConfig__switchContainer">
      <Switch
        checked={menuItem.isAvailable}
        onClick={(e, c) => handleItemToggle()}
      />
    </div>
  </div>
  );
}


// <div className="flex-container">
//   <div className="menuItemConfig__imageContainer">
//     <div className="IMAGE" /> 
//   </div> 
//   <div className="menuItemConfig__textContainer">
//     <div>Headline</div>
//     <div>Sub Text</div>
//   </div>
//   <div className="flex-spacer" />
//   <div className="switch" />
// </div>

// <Grid container spacing={2}>
// <Grid item xs={10}>
//   <Link to={`item/${menuItem.id}`}>
//     <Grid container spacing={0}>
//       <Grid item xs={2.5}>
//         <AsyncImage
//           imageRef={getMenuItemStorageRef(
//             menuItem.merchantId,
//             menuItem.id,
//             menuItem.photo
//           )}
//           className="MenuItemConfig__menuItemPicture"
//           alt={menuItem.title}
//         />
//       </Grid>
//       <Grid item xs={9}>
//         <div className="header-xs">{menuItem.title}</div>
//         <Spacer y={1} />
//         <div className="text-body-faded">
//           {menuItem.isAvailable ? "Available" : "Not Available"}
//         </div>
//       </Grid>
//     </Grid>
//   </Link>
// </Grid>
// <Grid item xs={2}>
//   <div className="MenuItemConfig__menuItemToggle">
//     <Switch
//       checked={menuItem.isAvailable}
//       onClick={(e, c) => handleItemToggle()}
//     />
//   </div>
// </Grid>
// </Grid>


export default MenuItemConfig;
