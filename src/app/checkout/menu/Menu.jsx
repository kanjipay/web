import { useEffect, useState } from "react";
import { Route, Routes, useParams } from "react-router-dom";
import { fetchMenuItems, fetchMenuSections, fetchMerchant, fetchOpeningHours } from "../../../utils/services/MenuService";
import MenuItemPage from "./MenuItemPage";
import MenuPage from "./MenuPage";
import MerchantAboutPage from "./MerchantAboutPage";
import BasketPage from "../basket/BasketPage"
import Order from "../checkout/Order";
import { fetchOrders } from "../../../utils/services/OrdersService";

export default function Menu() {
  let { merchantId } = useParams()

  const [merchant, setMerchant] = useState(undefined)
  const [menuSections, setMenuSections] = useState([])
  const [menuItems, setMenuItems] = useState([])
  const [openHourRanges, setOpenHourRanges] = useState([])
  const [orders, setOrders] = useState([])

  const deviceId = localStorage.getItem("deviceId")

  useEffect(() => {
    const merchantUnsub = fetchMerchant(merchantId, doc => {
      setMerchant({ id: doc.id, ...doc.data() })
    })

    const menuSectionUnsub = fetchMenuSections(merchantId, snapshot => {
      const sections = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      setMenuSections(sections)
    })

    const hourRangeUnsub = fetchOpeningHours(merchantId, snapshot => {
      const hourRanges = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      setOpenHourRanges(hourRanges)
    })

    const menuItemUnsub = fetchMenuItems(merchantId, snapshot => {
      const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      setMenuItems(items)
    })


    const orderUnsub = fetchOrders(deviceId, merchantId, snapshot => {
      const orders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      setOrders(orders)
    })

    return (() => {
      merchantUnsub()
      menuSectionUnsub()
      menuItemUnsub()
      hourRangeUnsub()
      orderUnsub()
    })
  }, [merchantId, deviceId])

  return <div>
    <Routes>
      <Route path="items/:itemId" element={<MenuItemPage merchant={merchant} />}/>
      <Route path="about" element={<MerchantAboutPage merchant={merchant} openHourRanges={openHourRanges} menuItems={menuItems} menuSections={menuSections} />}/>
      <Route path="basket" element={<BasketPage merchant={merchant} />} />
      <Route path="checkout/:orderId/*" element={<Order />}/>

      <Route path="*" element={
        <MenuPage
          merchant={merchant}
          openHourRanges={openHourRanges}
          menuItems={menuItems}
          menuSections={menuSections}
          orders={orders}
        />
      } />
    </Routes>
  </div>
}