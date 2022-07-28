import MainButton from "../../../components/MainButton"
import Spacer from "../../../components/Spacer"
import { ButtonTheme } from "../../../components/ButtonTheme"
import { useNavigate } from "react-router-dom"
import AsyncImage from "../../../components/AsyncImage"
import { getEventStorageRef } from "../../../utils/helpers/storage"
import Spinner from "../../../assets/Spinner"
import { formatCurrency } from "../../../utils/helpers/money"
import TicketCheckerNavBar from "../TicketCheckerNavBar"

export default function EventPage({ event, products, merchant }) {
  const navigate = useNavigate()

  const handleScanTickets = () => navigate("checker")
  const handleSeeGuestlist = () => navigate("guestlist")

  const { merchantId, photo, title, id: eventId } = event

  function getSoldCount(products) {
    return products.reduce((total, product) => total + product.soldCount, 0)
  }

  function getRevenue(products) {
    const amountInCents = products.reduce(
      (total, product) => total + product.soldCount * product.price,
      0
    )
    return formatCurrency(amountInCents, merchant.currency)
  }

  return (
    <div className="container">
      <TicketCheckerNavBar title={event.title} back="../.." />
      <Spacer y={6} />
      <AsyncImage
        imageRef={getEventStorageRef(event, photo)}
        className="headerImage"
        alt={title}
      />

      <div className="content">
        <Spacer y={3} />
        <h1 className="header-l">{event.title}</h1>
        <Spacer y={2} />
        {products ? (
          <div>
            <p>Tickets sold: {getSoldCount(products)}</p>
            <Spacer y={2} />
            <p>Revenue: {getRevenue(products)}</p>
          </div>
        ) : (
          <div
            style={{
              height: 200,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Spinner />
          </div>
        )}
      </div>

      <div className="anchored-bottom">
        <div style={{ padding: 16 }}>
          <MainButton title="Scan tickets" onClick={handleScanTickets} />
          <Spacer y={2} />
          <MainButton
            title="See guestlist"
            buttonTheme={ButtonTheme.MONOCHROME_OUTLINED}
            onClick={handleSeeGuestlist}
          />
        </div>
      </div>
    </div>
  )
}
