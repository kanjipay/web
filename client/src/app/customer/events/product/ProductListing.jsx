import { Link } from "react-router-dom"
import Forward from "../../../../assets/icons/Forward"
import { Colors } from "../../../../components/CircleButton"
import Spacer from "../../../../components/Spacer"
import { formatCurrency } from "../../../../utils/helpers/money"
import { dateFromTimestamp } from "../../../../utils/helpers/time"
import { format } from "date-fns"

export default function ProductListing({ product, linkPath = product.id }) {
  const isSoldOut = product.soldCount >= product.capacity
  const releaseDate = dateFromTimestamp(product.releasesAt)
  const isReleased = releaseDate < new Date()
  const isAvailable = product.isAvailable && product.soldCount + product.reservedCount < product.capacity && isReleased
  const backgroundColor = isAvailable ? Colors.PRIMARY_LIGHT : Colors.OFF_WHITE_LIGHT
  const textColor = isAvailable ? Colors.BLACK : Colors.GRAY_LIGHT

  let message

  if (isAvailable) {
    message = formatCurrency(product.price)
  } else if (!isReleased) {
    message = `Releases ${format(releaseDate, "MMM do")} at ${format(releaseDate, "H:mm")}`
  } else if (isSoldOut) {
    message = "Sold out"
  } else {
    message = "Unavailable"
  }

  const productListing = <div style={{ borderRadius: 16, backgroundColor, padding: "16px", display: "flex", alignItems: "center" }}>
    <div>
      <p className="header-xs" style={{ color: textColor }}>{product.title}</p>
      <Spacer y={1} />
      <p className="text-caption" style={{ color: textColor }}>{message}</p>
    </div>
    <div className="flex-spacer" />
    {
      isAvailable && <Forward length={20} color={Colors.PRIMARY} />
    }
  </div>

  return isAvailable ? 
    <Link to={linkPath} state={{ product }}>
      {productListing}
    </Link> :
    productListing
}