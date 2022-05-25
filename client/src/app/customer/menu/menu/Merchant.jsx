import { orderBy, where } from "firebase/firestore";
import { useEffect, useState } from "react";
import { Route, Routes, useParams } from "react-router-dom";
import Collection from "../../../../enums/Collection";
import OrderStatus from "../../../../enums/OrderStatus";
import { IdentityManager } from "../../../../utils/IdentityManager";
import BasketPage from "../basket/BasketPage";
import useBasket from "../basket/useBasket";
import MenuItemPage from "./MenuItemPage";
import MenuPage from "./MenuPage";
import MerchantAboutPage from "./MerchantAboutPage";

export default function Merchant() {
  let { merchantId } = useParams();

  const [merchant, setMerchant] = useState(undefined);
  const [menuSections, setMenuSections] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [openHourRanges, setOpenHourRanges] = useState([]);
  const [orders, setOrders] = useState([]);

  const { basketItems, clearBasket } = useBasket()

  useEffect(() => {
    if (basketItems.some(i => i.merchantId !== merchantId)) {
      clearBasket()
    }

    const merchantUnsub = Collection.MERCHANT.onChange(merchantId, setMerchant)

    const menuSectionUnsub = Collection.MENU_SECTION.queryOnChange(
      setMenuSections,
      where("merchantId", "==", merchantId),
      orderBy("sortOrder", "asc")
    )

    const menuItemUnsub = Collection.MENU_ITEM.queryOnChange(
      setMenuItems,
      where("merchantId", "==", merchantId),
      orderBy("sortOrder", "asc")
    )

    const userId = IdentityManager.main.getPseudoUserId()

    const orderUnsub = Collection.ORDER.queryOnChange(
      setOrders,
      where("merchantId", "==", merchantId),
      where("userId", "==", userId),
      where("status", "==", OrderStatus.PAID),
      orderBy("createdAt", "desc")
    )

    const hourRangeUnsub = Collection.OPENING_HOUR_RANGE.queryOnChange(
      setOpenHourRanges,
      where("merchantId", "==", merchantId)
    )

    return () => {
      merchantUnsub();
      menuSectionUnsub();
      menuItemUnsub();
      hourRangeUnsub();
      orderUnsub();
    };
  }, [merchantId, basketItems, clearBasket]);

  return <Routes>
    <Route
      path="items/:itemId"
      element={<MenuItemPage merchant={merchant} />}
    />
    <Route
      path="about"
      element={
        <MerchantAboutPage
          merchant={merchant}
          openHourRanges={openHourRanges}
          menuItems={menuItems}
          menuSections={menuSections}
        />
      }
    />
    <Route path="basket" element={<BasketPage merchant={merchant} />} />

    <Route
      path="*"
      element={
        <MenuPage
          merchant={merchant}
          openHourRanges={openHourRanges}
          menuItems={menuItems}
          menuSections={menuSections}
          orders={orders}
        />
      }
    />
  </Routes>
}