import { useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import AsyncImage from "../../../components/AsyncImage";
import CircleButton, { ButtonTheme } from "../../../components/CircleButton";
import Spacer from "../../../components/Spacer";
import "./MenuItemPage.css";
import NavBar from "../../../components/NavBar";
import { Helmet } from "react-helmet-async";
import Plus from "../../../assets/icons/Plus";
import Minus from "../../../assets/icons/Minus";
import useBasket from "../basket/useBasket";
import MainButton from "../../../components/MainButton";
import { formatCurrency } from "../../../utils/helpers/money";
import DietaryAttribute from "./DietaryAttribute";
import { getMenuItemStorageRef } from "../../../utils/helpers/storage";

export default function MenuItemPage({ merchant }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { merchantId, itemId } = useParams();
  const { addItem, basketItems, changeQuantity, removeItem, changeMerchant } =
    useBasket();
  const { item } = location.state;
  const itemInBasket = basketItems.find(
    (basketItem) => basketItem.id === item.id
  );
  const isInCart = !!itemInBasket;
  const itemCountInBasket = itemInBasket ? itemInBasket.quantity : 0;

  const maxQuantity = 20;
  const minQuantity = isInCart ? 0 : 1;

  const initialQuantity = isInCart ? itemCountInBasket : 1;
  const [quantity, setQuantity] = useState(initialQuantity);

  function handleAddToBasket() {
    if (
      basketItems.filter(
        (basketItem) => basketItem.merchant_id === item.merchant_id
      ).length === 0
    ) {
      changeMerchant(merchant);
    }

    if (isInCart) {
      quantity === 0
        ? removeItem(item)
        : changeQuantity({ itemId: item.id, quantity });
    } else {
      addItem(item);
      changeQuantity({ itemId: item.id, quantity });
    }

    navigate(-1);
  }

  function incrementQuantity() {
    if (quantity < maxQuantity) {
      setQuantity(quantity + 1);
    }
  }

  function decrementQuantity() {
    if (quantity > minQuantity) {
      setQuantity(quantity - 1);
    }
  }

  const dietaryBubbles = [];

  if (item.spice_level > 0) {
    const chilliCount = Math.min(3, item.spice_level);

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

  DietaryAttribute.allItems.forEach((attr) => {
    if (item.dietary_attributes.includes(attr.name)) {
      dietaryBubbles.push(
        <div
          className="header-xs"
          key={attr.name}
          style={{
            color: attr.foregroundColor,
            backgroundColor: attr.backgroundColor,
            padding: "4px 8px",
            borderRadius: 100,
          }}
        >
          {attr.displayNameLong}
        </div>
      );
    }
  });

  return (
    <div className="MenuItemPage container">
      <Helmet>
        <title>{item.title}</title>
      </Helmet>

      <NavBar
        backPath=".."
        title={item.title}
        transparentDepth={100}
        opaqueDepth={150}
      />

      <AsyncImage
        imageRef={getMenuItemStorageRef(merchantId, itemId, item.photo)}
        className="headerImage"
        alt={item.title}
      />

      <Spacer y={3} />
      <div className="MenuItemPage__content">
        <h1 className="MenuItemPage__title header-l">{item.title}</h1>
        <Spacer y={2} />
        <div
          style={{ display: "flex", flexWrap: "wrap", rowGap: 4, columnGap: 4 }}
        >
          {dietaryBubbles}
        </div>
        <Spacer y={2} />
        <p className="MenuItemPage__description text-body-faded">
          {item.description}
        </p>
        <Spacer y={3} />
        <h3 className="header-s">Number of items</h3>
        <Spacer y={2} />
        <div
          className="MenuItemPage__counter"
          style={{ display: "flex", columnGap: 4 }}
        >
          <CircleButton
            Icon={Minus}
            length={32}
            buttonTheme={ButtonTheme.PRIMARY}
            onClick={() => decrementQuantity()}
            disabled={quantity <= minQuantity}
          />
          <div className="MenuItemPage__counterValue">{quantity}</div>
          <CircleButton
            Icon={Plus}
            length={32}
            buttonTheme={ButtonTheme.PRIMARY}
            onClick={() => incrementQuantity()}
            disabled={quantity >= maxQuantity}
          />
        </div>
      </div>

      <div className="anchored-bottom">
        <div style={{ margin: "8px" }}>
          <MainButton
            title={
              isInCart
                ? quantity === 0
                  ? "Remove from basket"
                  : "Edit amount"
                : "Add to basket"
            }
            sideMessage={
              quantity > 0 ? formatCurrency(item.price * quantity) : null
            }
            onClick={() => handleAddToBasket()}
            style={{ boxSizing: "borderBox" }}
          />
        </div>
      </div>
    </div>
  );
}
