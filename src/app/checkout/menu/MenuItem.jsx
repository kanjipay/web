import { Link } from 'react-router-dom'
import AsyncImage from '../../../components/AsyncImage'
import Spacer from '../../../components/Spacer'
import './MenuItem.css'

function formatCurrency(int) {
  return "£" + (int / 100).toFixed(2).toString()
}

export default function MenuItem({ item }) {
  const merchantId = item.merchantId

  return (
    <div className='MenuItem'>
      <Link to={`items/${item.id}`} state={{ item }}>
        <AsyncImage
          storagePath={`merchants/${merchantId}/menu_items/${item.id}/${item.photo}`}
          className='MenuItem__image'
        />
        <Spacer y={0.5} />
        <h3 className='MenuItem__title header-xs'>{item.title}</h3>
        <Spacer y={0.5} />
        <p className='MenuItem__description text-caption'>{item.description}</p>
        {/* <p className='MenuItem__price'>{formatCurrency(item.price)}</p> */}
      </Link>
    </div>
  )
}