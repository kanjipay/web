import { collection, doc, onSnapshot, query, where } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import AsyncImage from './components/AsyncImage';
import { db } from './FirebaseUtils';
import "./Menu.css"

export default function Menu() {
  let { merchantId } = useParams()

  const [merchant, setMerchant] = useState(null)
  const [menuSections, setMenuSections] = useState([])
  const [menuItems, setMenuItems] = useState([])
  const [openHourRanges, setOpenHourRanges] = useState([])

  useEffect(() => {
    const merchantRef = doc(db, "Merchant", merchantId)

    const merchantUnsub = onSnapshot(merchantRef, doc => {
      setMerchant({ id: doc.id, ...doc.data() })
    })

    const menuSectionQuery = query(collection(db, "MenuSection"), where("merchant", "==", merchantRef))

    const menuSectionUnsub = onSnapshot(menuSectionQuery, snapshot => {
      const sections = snapshot.docs.map(doc => {
        const section = { id: doc.id, ...doc.data() }
        section.merchantId = section.merchant.id
        delete section.merchant

        return section
      })

      setMenuSections(sections)
    })

    const openHourQuery = query(collection(db, "OpeningHourRange"), where("merchant", "==", merchantRef))

    const hourRangeUnsub = onSnapshot(openHourQuery, snapshot => {
      const hourRanges = snapshot.docs.map(doc => {
        const range = { id: doc.id, ...doc.data() }
        range.merchantId = range.merchant.id
        delete range.merchant

        return range
      })

      setOpenHourRanges(hourRanges)
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
      hourRangeUnsub()
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

  function generateOpenHourText() {
    const now = new Date()
    let dayOfWeek = now.getDay()

    // The above defines day of week as 0 - 6 Sun - Sat
    // We want 1 - 7 Mon - Sun
    if (dayOfWeek === 0) {
      dayOfWeek = 7
    }

    const minutes = now.getHours() * 60 + now.getMinutes()

    const todayRanges = openHourRanges
      .filter(range => range.day_of_week === dayOfWeek)
      .sort((range1, range2) => range1.close_time - range2.close_time)


    const openRanges = todayRanges.filter(range => range.close_time > minutes)

    function formatMinutes(mins) {
      const minsRemainder = (mins % 60).toLocaleString('en-GB', {
        minimumIntegerDigits: 2,
        useGrouping: false
      })

      const hours = ((mins - minsRemainder) / 60).toLocaleString('en-GB', {
        minimumIntegerDigits: 2,
        useGrouping: false
      })

      return `${hours}:${minsRemainder}`
    }

    if (openRanges.length === 0) {
      if (todayRanges.length === 0) {
        return "Closed today"
      } else {
        const mins = todayRanges[todayRanges.length - 1].close_time
        return `Closed at ${formatMinutes(mins)}`
      }
    } else {
      const mins = openRanges[openRanges.length - 1].close_time
      return `Open until ${formatMinutes(mins)}`
    }
  }

  return (
    <div className='Menu'>
      { merchant &&
          <AsyncImage
            storagePath={`merchants/${merchantId}/${merchant.photo}`}
            className='Menu__headerImage'
          />
      }
      <div className='Menu__content'>
        { merchant &&
          <div>
            <h1 className='Menu__title'>{merchant.display_name}</h1>
            <p>{merchant.tags.join(" · ")}</p>
          </div>
        }
        { openHourRanges && <p>{generateOpenHourText()}</p>}
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