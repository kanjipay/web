import { Link } from 'react-router-dom'
import AsyncImage from '../../../components/AsyncImage'
import { Colors } from '../../../components/CircleButton'
import Spacer from '../../../components/Spacer'
import { formatCurrency } from '../../../utils/helpers/money'
import DietaryAttribute from './DietaryAttribute'
import './MenuItem.css'

export default function MenuItem({ item }) {
  const merchantId = item.merchantId
  const dietaryAttrs = item.dietary_attributes
  const dietaryBubbles = []

  if (item.spice_level > 0) {
    const chilliCount = Math.min(3, item.spice_level)

    dietaryBubbles.push(
      <div key="SPICE" className='MenuItem__spiceLevel bubble'>
        { Array(chilliCount).fill(
          <img src='/img/chilli.png' className='chilli'/>
        ) }
      </div>
    )
  }

  for (var attr of DietaryAttribute.allItems) {
    if (dietaryAttrs.includes(attr.name)) {
      dietaryBubbles.push(
        <div key={attr.name} className={`MenuItem__${attr.className} bubble`}>
          {attr.displayName}
        </div>
      )
    }
  }

  const isAvailable = item.is_available
  const textColor = isAvailable ? Colors.BLACK : Colors.GRAY_LIGHT


  const menuItemContents = <div>
    <div className='MenuItem__imageContainer'>
      <AsyncImage
        storagePath={`merchants/${merchantId}/menu_items/${item.id}/${item.photo}`}
        className={`MenuItem__image ${isAvailable ? "" : "MenuItem__imageBlur"}`}
      />
      { !isAvailable && <div className='MenuItem__shadow'/> }
      { !isAvailable && <div className='MenuItem__notAvailable header-s'>Not available</div> }
    </div>

    <Spacer y={1} />
    <div className='grid'>
      <div className='MenuItem__title header-xs' style={{ color: textColor }}>{item.title}</div>
      { dietaryBubbles }
      <div className='MenuItem__spacer' />
      <div className='MenuItem__price bubble header-xs'  style={{ color: textColor }}>{formatCurrency(item.price)}</div>
    </div>
    <Spacer y={0.5} />
    <p className='MenuItem__description text-caption'>{item.description}</p>
  </div>

  return (
    <div className='MenuItem'>
      {
        isAvailable ?
          <Link to={`items/${item.id}`} state={{ item }}>{menuItemContents}</Link> :
          <div>{menuItemContents}</div>
      }
    </div>
  )
}