import { Link } from "react-router-dom"
import Forward from "../../../../assets/icons/Forward"
import { Colors } from "../../../../enums/Colors"
import Spacer from "../../../../components/Spacer"
import { formatCurrency } from "../../../../utils/helpers/money"
import { dateFromTimestamp } from "../../../../utils/helpers/time"
import { format } from "date-fns"

export default function ProductListing({
  product,
  currency,
  linkPath = product.id,
  isPublished,
  ...props
}) {
  const isSoldOut = product.soldCount + product.reservedCount >= product.capacity
  const releaseDate = dateFromTimestamp(product.releasesAt)
  const isReleased = releaseDate < new Date()
  const isAvailable =
    product.isAvailable &&
    product.soldCount + product.reservedCount < product.capacity &&
    isReleased &&
    isPublished
  const backgroundColor = isAvailable ? Colors.BLACK : Colors.OFF_WHITE
  const textColor = isAvailable ? Colors.WHITE : Colors.BLACK

  let message

  if (!isPublished) {
    message = "Not published"
  } else if (isAvailable) {
    message = formatCurrency(product.price, currency)
  } else if (!isReleased) {
    message = `Releases ${format(releaseDate, "MMM do")} at ${format(
      releaseDate,
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
      }}
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
