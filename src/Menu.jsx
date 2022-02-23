import { useParams } from 'react-router-dom';

function Menu() {
  let { merchant_id } = useParams()

  return <h1>{merchant_id}</h1>
}

export default Menu