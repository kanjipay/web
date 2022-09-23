import { format } from "date-fns"
import SquareLabel from "../../../../components/SquareLabel"
import { formatCurrency } from "../../../../utils/helpers/money"
import { dateFromTimestamp } from "../../../../utils/helpers/time"
import { Colors } from "../../../../enums/Colors"
import Spacer from "../../../../components/Spacer"
import { Link, useNavigate } from "react-router-dom"
import { useState } from "react"

export default function ProductListing({ product, currency, style, ...props }) {
  const [isHovering, setIsHovering] = useState(false)
  const { title, releasesAt, soldCount, capacity, price } = product
  const releaseDate = dateFromTimestamp(releasesAt)
  const navigate = useNavigate()

  let label

  if (releaseDate) {
    const hasReleased = releaseDate < new Date()
    label = `Release${hasReleased ? "d" : "s"} on ${format(
      releaseDate,
      "do MMM"
    )} at ${format(releaseDate, "HH:mm")}`
  } else {
    label = "Released"
  }

  return <div
    style={{
      padding: 16,
      backgroundColor: isHovering
        ? Colors.OFF_WHITE
        : Colors.OFF_WHITE_LIGHT,
      ...style
    }}
    onClick={() => navigate(`p/${product.id}`)}
    onMouseEnter={() => setIsHovering(true)}
    onMouseLeave={() => setIsHovering(false)}
    {...props}
  >
    <h3 className="header-s">{title}</h3>
    <Spacer y={2} />
    <p>{label}</p>
    <Spacer y={2} />
    <p>
      <span style={{ fontWeight: 600 }}>{soldCount}</span>
      {` / ${capacity} tickets sold`}
    </p>
    <Spacer y={2} />
    <SquareLabel>{formatCurrency(price, currency)}</SquareLabel>
  </div>
}
