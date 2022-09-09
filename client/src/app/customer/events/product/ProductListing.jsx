import { Link } from "react-router-dom"
import Forward from "../../../../assets/icons/Forward"
import { Colors } from "../../../../enums/Colors"
import Spacer from "../../../../components/Spacer"
import { formatCurrency } from "../../../../utils/helpers/money"
import { dateFromTimestamp } from "../../../../utils/helpers/time"
import { format } from "date-fns"
import { useState } from "react"

export default function ProductListing({
  product,
  currency,
  linkPath = product.id,
  processingFee,
  isPublished,
  ...props
}) {
  const [isHovering, setIsHovering] = useState(false)
  
  const currDate = new Date()
  const releaseDate = dateFromTimestamp(product.releasesAt)
  const releaseEndDate = dateFromTimestamp(product.releaseEndsAt)

  const isUnreleased = !!releaseDate && releaseDate > currDate
  const isExpired = !!releaseEndDate && releaseEndDate < currDate
  const isSoldOut = product.soldCount + product.reservedCount >= product.capacity

  const isAvailable =
    product.isAvailable &&
    !isSoldOut &&
    !isUnreleased &&
    !isExpired
  const backgroundColor = isAvailable ? 
    (isHovering ? Colors.OFF_BLACK_LIGHT : Colors.BLACK) : 
    Colors.OFF_WHITE

  const textColor = isAvailable ? Colors.WHITE : Colors.BLACK

  let message

  if (isAvailable) {
    message = formatCurrency(product.price, currency)
  } else if (isUnreleased) {
    message = `Releases ${format(releaseDate, "MMM do")} at ${format(
      releaseDate,
      "H:mm"
    )}`
  } else if (isExpired) {
    message = `Release ended ${format(releaseEndDate, "MMM do")} at ${format(
      releaseEndDate,
      "H:mm"
    )}`
  } else if (isSoldOut) {
    message = "Sold out"
  } else {
    message = "Unavailable"
  }

  const productListing = (
    <div
      style={{
        backgroundColor,
        padding: "16px",
        display: "flex",
        alignItems: "center",
        borderRadius: 2
      }}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      test-name="product-listing"
      {...props}
    >
      <div>
        <p
          className="header-xs"
          style={{
            color: textColor,
            textDecoration: isAvailable ? "none" : "line-through",
          }}
          test-name="product-listing-title"
        >
          {product.title}
        </p>
        <Spacer y={1} />
        <p
          className="text-caption"
          test-name="product-listing-message"
          style={{ color: textColor }}
        >
          {message}
        </p>
      </div>
      <div className="flex-spacer" />
      {isAvailable && <Forward length={20} color={Colors.WHITE} />}
    </div>
  )

  return isAvailable ? (
    <Link to={linkPath} state={{ product }}>
      {productListing}
    </Link>
  ) : (
    productListing
  )
}
