import { collection, doc, onSnapshot, query, where } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import AsyncImage from '../../../components/AsyncImage';
import { db } from '../../../utils/FirebaseUtils';
import MenuItem from './MenuItem';
import MenuSection from './MenuSection';
import "./MenuPage.css"
import Spacer from '../../../components/Spacer';
import { formatMinutes } from '../../../utils/helpers/time';

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

  return merchant && openHourRanges ?
    <div className='Menu container'>
      <AsyncImage
        storagePath={`merchants/${merchantId}/${merchant.photo}`}
        className='Menu__headerImage'
      />
      <Spacer y={3}/>
      <div className='Menu__content'>
        <h1 className='Menu__title header-l'>{merchant.display_name}</h1>
        <Spacer y={1} />
        <Link to={`about`} state={{ merchant, openHourRanges }}>
          <p className='text-body'>{merchant.tags.join(" · ")}</p>
          <Spacer y={1} />
          <p className='text-body-faded'>{generateOpenHourText()}</p>
        </Link>
        <Spacer y={3} />
        {
          menuSections.map(section => (
            <MenuSection key={section.id} section={section}>{
              groupedMenuItems[section.id] &&
                groupedMenuItems[section.id].map(menuItem => (
                  <div>
                    <MenuItem item={menuItem} key={menuItem.id}/>
                    <Spacer y={3} />
                  </div>
              ))
            }</MenuSection>
          ))
        }
      </div>
    </div> :
    <div />
}