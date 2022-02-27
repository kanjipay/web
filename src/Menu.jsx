import { collection, doc, onSnapshot, query, where } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import AsyncImage from './components/AsyncImage';
import { db } from './FirebaseUtils';
import "./Menu.css"

export default function Menu() {
  let { merchantId } = useParams()

  const [merchant, setMerchant] = useState(null)
  const [menuSections, setMenuSections] = useState([])
  const [menuItems, setMenuItems] = useState([])

  useEffect(() => {
    const merchantRef = doc(db, "Merchant", merchantId)

    const merchantUnsub = onSnapshot(merchantRef, doc => {
      setMerchant({ id: doc.id, ...doc.data() })
    })

    const menuSectionQuery = query(collection(db, "MenuSection"), where("merchant", "==", merchantRef))

    const menuSectionUnsub = onSnapshot(menuSectionQuery, sectionSnapshot => {
      const sections = sectionSnapshot.docs.map(doc => {
        const section = { id: doc.id, ...doc.data() }
        section.merchantId = section.merchant.id
        delete section.merchant

        return section
      })

      setMenuSections(sections)
    })

    const menuItemQuery = query(collection(db, "MenuItem"), where("merchant", "==", merchantRef))

    const menuItemUnsub = onSnapshot(menuItemQuery, itemSnapshot => {
      const items = itemSnapshot.docs.map(doc => {
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
    })
  }, [merchantId])

  const groupedMenuItems = {}

  menuItems.forEach(menuItem => {
    const menuSectionId = menuItem.sectionId
    const currValue = groupedMenuItems[menuSectionId]

    if (currValue) {
      groupedMenuItems[menuSectionId].push(menuItem)
    } else {
      groupedMenuItems[menuSectionId] = [menuItem]
    }
  })

  return (
    <div className='Menu'>
      { merchant &&
          <AsyncImage
            storagePath={`merchants/${merchantId}/${merchant.photo}`}
            className='Menu__headerImage'
          />
      }
      <div className='Menu__content'>
        { merchant && <h1 className='Menu__title'>{merchant.display_name}</h1> }
        {
          menuSections.map(section => (
            <MenuSection key={section.id} section={section}>{
              groupedMenuItems[section.id] &&
                groupedMenuItems[section.id].map(menuItem => (
                  <MenuItem item={menuItem} key={menuItem.id}/>
              ))
            }</MenuSection>
          ))
        }
      </div>
    </div>
  )
}

function MenuSection({ section, children }) {
  return (
    <div className='MenuSection'>
      <h2 className='MenuSection__title'>{section.name}</h2>
      {children}
    </div>
  )
}

function MenuItem({ item }) {
  const merchantId = item.merchantId

  console.log(item)

  function onItemClick() {

  }

  return (
    <div className='MenuItem'>
      <Link to={`items/${item.id}`} state={{ item }}>
        <AsyncImage
          storagePath={`merchants/${merchantId}/menu_items/${item.id}/${item.photo}`}
          className='MenuItem__image'
        />
        <h3 className='MenuItem__title'>{item.title}</h3>
        <p className='MenuItem__description'>{item.description}</p>
        <p className='MenuItem__price'>{formatCurrency(item.price)}</p>
      </Link>
    </div>
  )
}

function formatCurrency(int) {
  return "£" + (int / 100).toFixed(2).toString()
}