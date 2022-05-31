import { format } from "date-fns"
import SquareLabel from "../../../components/SquareLabel"
import { formatCurrency } from "../../../utils/helpers/money"
import { dateFromTimestamp } from "../../../utils/helpers/time"
import { Colors } from "../../../components/CircleButton"
import Spacer from "../../../components/Spacer"
import { Link } from "react-router-dom"

export default function ProductListing({ product }) {
  const { title, releasesAt, soldCount, capacity, price } = product
  const releaseDate = dateFromTimestamp(releasesAt)
  const hasReleased = releaseDate < new Date()
  const releaseLabel = `Release${hasReleased ? "d" : "s"} on ${format(releaseDate, "do MMM")} at ${format(releaseDate, "HH:mm")}`

  return <Link to={`p/${product.id}`}>
    <div style={{ padding: 16, backgroundColor: Colors.OFF_WHITE_LIGHT }}>
      <h3 className="header-s">{title}</h3>
      <Spacer y={2} />
      <p>{releaseLabel}</p>
      <Spacer y={2} />
      <p>
        <span style={{ fontWeight: 600 }}>{soldCount}</span>
        {` / ${capacity} tickets sold`}
      </p>
      <Spacer y={2} />
      <SquareLabel>{formatCurrency(price)}</SquareLabel>
    </div>
  </Link>
}