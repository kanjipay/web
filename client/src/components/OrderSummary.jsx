import { formatCurrency } from "../utils/helpers/money"
import { Colors } from "../enums/Colors"

export function OrderSummary({ lineItems, currency, feePercentage = 0 }) {
  const totalWithoutFee = lineItems.reduce((total, lineItem) => {
    const { price, quantity } = lineItem
    return total + price * quantity
  }, 0)

  const fee = Math.round(totalWithoutFee * feePercentage)

  const total = totalWithoutFee + fee

  const itemStyle = {
    display: "flex",
    alignItems: "center",
    columnGap: 16,
    height: 48,
  }

  return (
    <div>
      {lineItems.map(({ title, quantity, price }) => {
        return (
          <div style={itemStyle}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: 24,
                height: 24,
                backgroundColor: Colors.OFF_WHITE_LIGHT,
              }}
            >
              <p test-name="order-summary-line-item-quantity">{quantity}</p>
            </div>
            <p>{title}</p>
            <div style={{ flexGrow: 100 }}></div>
            <p test-name="order-summary-line-item-amount">
              {formatCurrency(price, currency)}
            </p>
          </div>
        )
      })}

      {feePercentage && feePercentage > 0 && (
        <div style={itemStyle}>
          <p>Processing fee</p>
          <div style={{ flexGrow: 100 }}></div>
          <p test-id="order-summary-processing-fee">
            {formatCurrency(fee, currency)}
          </p>
        </div>
      )}
      <div style={{ height: 1, backgroundColor: Colors.OFF_WHITE }}></div>
      <div style={itemStyle}>
        <p style={{ fontWeight: 500 }}>Total</p>
        <div style={{ flexGrow: 100 }}></div>
        <p style={{ fontWeight: 500 }} test-id="order-summary-total">
          {formatCurrency(total, currency)}
        </p>
      </div>
    </div>
  )
}
