import { useEffect, useState } from "react";
import { Route, Routes, useParams } from "react-router-dom";
import { fetchMenuItems, fetchMenuSections, fetchMerchant, fetchOpeningHours } from "../../../utils/services/MenuService";
import MenuItemPage from "./MenuItemPage";
import MenuPage from "./MenuPage";
import MerchantAboutPage from "./MerchantAboutPage";
import BasketPage from "../basket/BasketPage"

export default function Menu() {
  let { merchantId } = useParams()

  const [merchant, setMerchant] = useState(null)
  const [menuSections, setMenuSections] = useState([])
  const [menuItems, setMenuItems] = useState([])
  const [openHourRanges, setOpenHourRanges] = useState([])

  useEffect(() => {
    const merchantUnsub = fetchMerchant(merchantId, doc => {
      setMerchant({ id: doc.id, ...doc.data() })
    })

    const menuSectionUnsub = fetchMenuSections(merchantId, snapshot => {
      const sections = snapshot.docs.map(doc => {
        const section = { id: doc.id, ...doc.data() }
        section.merchantId = section.merchant.id
        delete section.merchant

        return section
      })

      setMenuSections(sections)
    })

    const hourRangeUnsub = fetchOpeningHours(merchantId, snapshot => {
      const hourRanges = snapshot.docs.map(doc => {
        const range = { id: doc.id, ...doc.data() }
        range.merchantId = range.merchant.id
        delete range.merchant

        return range
      })

      setOpenHourRanges(hourRanges)
    })

    const menuItemUnsub = fetchMenuItems(merchantId, snapshot => {
      const items = snapshot.docs.map(doc => {
        const item = { id: doc.id, ...doc.data() }
        item.merchantId = item.merchant.id
        item.sectionId = item.section.id

        delete item.merchant
        delete item.section

        return item
      })

      setMenuItems(items)
    })

    return (() => {
      merchantUnsub()
      menuSectionUnsub()
      menuItemUnsub()
      hourRangeUnsub()
    })
  }, [merchantId])

  return <div>
    <Routes>
      <Route path="items/:itemId" element={<MenuItemPage merchant={merchant} />}/>
      <Route path="about" element={<MerchantAboutPage merchant={merchant} openHourRanges={openHourRanges} menuItems={menuItems} menuSections={menuSections} />}/>
      <Route path="basket" element={<BasketPage merchant={merchant} />} />
      <Route path="*" element={<MenuPage merchant={merchant} openHourRanges={openHourRanges} menuItems={menuItems} menuSections={menuSections} />} />

    </Routes>
  </div>
}