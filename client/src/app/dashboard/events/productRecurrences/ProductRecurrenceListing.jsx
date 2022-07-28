import { useState } from "react"
import { Link } from "react-router-dom"
import Spacer from "../../../../components/Spacer"
import SquareLabel from "../../../../components/SquareLabel"
import { Colors } from "../../../../enums/Colors"
import { formatCurrency } from "../../../../utils/helpers/money"
import { timePeriodString } from "../eventRecurrences/EventRecurrenceListing"

export default function ProductRecurrenceListing({ productRecurrence, currency }) {
  const [isHovering, setIsHovering] = useState(false)

  const { title, price, releaseDateInterval } = productRecurrence

  return <Link to={`pr/${productRecurrence.id}`}>
    <div
      style={{
        backgroundColor: isHovering ? Colors.OFF_WHITE : Colors.OFF_WHITE_LIGHT,
        padding: 16
      }}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      <h3 className="header-s">{title}</h3>
      <Spacer y={2} />
      <p className="text-body">Releases {timePeriodString(releaseDateInterval.amount, releaseDateInterval.interval)} before the event starts.</p>
      <Spacer y={2} />
      <SquareLabel>{formatCurrency(price, currency)}</SquareLabel>
    </div>
  </Link>
}