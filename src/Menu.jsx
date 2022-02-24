import { useParams } from 'react-router-dom';

export default function Menu() {
  let { merchant_id } = useParams()

  return <h1>{merchant_id}</h1>
}