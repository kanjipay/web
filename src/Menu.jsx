import { collection, doc, onSnapshot, query, where } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import AsyncImage from './components/AsyncImage';
import { db } from './FirebaseUtils';
import "./Menu.css"

export default function Menu() {
  let { merchant_id } = useParams()

  const [merchant, setMerchant] = useState([])
  const [menuSections, setMenuSections] = useState([])
  const [menuItems, setMenuItems] = useState([])

  useEffect(() => {
    const merchantRef = doc(db, "Merchant", merchant_id)

    const merchantUnsub = onSnapshot(merchantRef, merchantDoc => {
      setMerchant(merchantDoc.data())
    })

    const menuSectionQuery = query(collection(db, "MenuSection"), where("merchant", "==", merchantRef))

    const menuSectionUnsub = onSnapshot(menuSectionQuery, sectionSnapshot => {
      const sections = sectionSnapshot.docs.map(doc => ({
        id: doc.id,
        data: doc.data()
      }))

      setMenuSections(sections)
    })

    const menuItemQuery = query(collection(db, "MenuItem"), where("merchant", "==", merchantRef))

    const menuItemUnsub = onSnapshot(menuItemQuery, itemSnapshot => {
      const items = itemSnapshot.docs.map(doc => ({
        id: doc.id,
        data: doc.data()
      }))

      setMenuItems(items)
    })

    return (() => {
      merchantUnsub()
      menuSectionUnsub()
      menuItemUnsub()
    })
  }, [merchant_id])

  const groupedMenuItems = {}

  menuItems.forEach(menuItem => {
    const menuSectionId = menuItem.data.section.id
    const currValue = groupedMenuItems[menuSectionId]

    if (currValue) {
      groupedMenuItems[menuSectionId].push(menuItem)
    } else {
      groupedMenuItems[menuSectionId] = [menuItem]
    }
  })

  return (
    <div className='Menu'>
      <h1 className='Menu__title'>{merchant.display_name}</h1>
      {
        merchant.photo &&
        merchant_id &&
          <AsyncImage
            storagePath={`merchants/${merchant_id}/${merchant.photo}`}
            className='Menu__image'
          />
      }

      {
        menuSections.map(section => (
          <MenuSection key={section.id} section={section}>{
            groupedMenuItems[section.id] &&
              groupedMenuItems[section.id].map(menuItem => <MenuItem item={menuItem} key={menuItem.id}/>)
          }</MenuSection>
        ))
      }
    </div>
  )
}

function MenuSection({ section, children }) {
  return (
    <div className='MenuSection'>
      <h2 className='MenuSection__title'>{section.data.name}</h2>
      {children}
    </div>
  )
}

function MenuItem({ item }) {
  const merchantId = item.data.merchant.id

  return (
    <div className='MenuItem'>
      <AsyncImage
        storagePath={`merchants/${merchantId}/menu_items/${item.id}/${item.data.photo}`}
        className='MenuItem__image'
      />
      <h3 className='MenuItem__title'>{item.data.title}</h3>
      <p className='MenuItem__description'>{item.data.description}</p>
      <p className='MenuItem__price'>{formatCurrency(item.data.price)}</p>
    </div>
  )
}

function formatCurrency(int) {
  return "£" + (int / 100).toFixed(2).toString()
}