import { formatCurrency } from "../../../../utils/helpers/money";
import { getMenuItemStorageRef } from "../../../../utils/helpers/storage";
import DietaryAttribute from "./DietaryAttribute";
import "./MenuItem.css";
import Listing from "../../../../components/Listing";

export default function MenuItemListing({ item, basketCount = 0 }) {
  const merchantId = item.merchantId;
  const dietaryAttrs = item.dietaryAttributes;
  const dietaryBubbles = [];

  if (item.spiceLevel > 0) {
    const chilliCount = Math.min(3, item.spiceLevel);

    const chilliImages = [];

    for (let i = 0; i < chilliCount; i++) {
      chilliImages.push(
        <img
          key={i}
          src="/img/chilli.png"
          alt="Chilli icon"
          className="chilli"
        />
      );
    }

    dietaryBubbles.push(
      <div key="SPICE" className="MenuItem__spiceLevel bubble">
        {chilliImages}
      </div>
    );
  }

  for (var attr of DietaryAttribute.allItems) {
    if (dietaryAttrs.includes(attr.name)) {
      dietaryBubbles.push(
        <div
          key={attr.name}
          className="bubble"
          style={{
            color: attr.foregroundColor,
            backgroundColor: attr.backgroundColor,
          }}
        >
          {attr.displayName}
        </div>
      );
    }
  }

  return <Listing
    imageRef={getMenuItemStorageRef(merchantId, item.id, item.photo)}
    title={item.title}
    description={item.description}
    rightBubbleText={formatCurrency(item.price)}
    isAvailable={item.isAvailable}
    linkPath={`items/${item.id}`}
    linkState={{ item }}
    flexItems={dietaryBubbles}
  />
}
