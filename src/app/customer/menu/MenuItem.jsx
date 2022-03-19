import { Link } from "react-router-dom";
import AsyncImage from "../../../components/AsyncImage";
import { Colors } from "../../../components/CircleButton";
import Spacer from "../../../components/Spacer";
import { formatCurrency } from "../../../utils/helpers/money";
import { getMenuItemStorageRef } from "../../../utils/helpers/storage";
import DietaryAttribute from "./DietaryAttribute";
import "./MenuItem.css";

export default function MenuItem({ item, basketCount = 0 }) {
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

  const isAvailable = item.isAvailable;
  const textColor = isAvailable ? Colors.BLACK : Colors.GRAY_LIGHT;

  const menuItemContents = (
    <div>
      <div className="MenuItem__imageContainer">
        <AsyncImage
          imageRef={getMenuItemStorageRef(merchantId, item.id, item.photo)}
          className={`MenuItem__image ${
            isAvailable ? "" : "MenuItem__imageBlur"
          }`}
          alt={item.title}
        />
        {!isAvailable && <div className="MenuItem__shadow" />}
        {!isAvailable && (
          <div className="MenuItem__notAvailable header-s">Not available</div>
        )}
      </div>

      <Spacer y={1} />
      <div className="grid">
        <div className="MenuItem__title header-s" style={{ color: textColor }}>
          {item.title}
        </div>
        {dietaryBubbles}
        <div className="MenuItem__spacer" />
        <div
          className="MenuItem__price bubble header-xs"
          style={{ color: textColor }}
        >
          {formatCurrency(item.price)}
        </div>
      </div>
      <Spacer y={1} />
      <p className="MenuItem__description text-body-faded">
        {item.description}
      </p>
    </div>
  );

  return (
    <div className="MenuItem">
      {isAvailable ? (
        <Link to={`items/${item.id}`} state={{ item }}>
          {menuItemContents}
        </Link>
      ) : (
        <div>{menuItemContents}</div>
      )}
    </div>
  );
}
