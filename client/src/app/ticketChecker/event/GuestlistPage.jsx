import { format } from "date-fns"
import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import Discover from "../../../assets/icons/Discover"
import LoadingPage from "../../../components/LoadingPage"
import Spacer from "../../../components/Spacer"
import { Colors } from "../../../enums/Colors"
import { dateFromTimestamp } from "../../../utils/helpers/time"
import { NetworkManager } from "../../../utils/NetworkManager"
import TicketCheckerNavBar from "../TicketCheckerNavBar"

export default function GuestlistPage() {
  const { eventId, merchantId } = useParams()
  const [guestlistData, setGuestlistData] = useState(null)
  const [filteredGuestlistData, setFilteredGuestlistData] = useState(null)
  const [searchName, setSearchName] = useState(null)

  const handleSearchNameChange = (event) => {
    const newSearchName = event.target.value

    setSearchName(newSearchName)

    const filteredData = guestlistData.filter((datum) => {
      const { firstName, lastName, email } = datum

      const name = `${firstName} ${lastName}`

      return (
        name.toLowerCase().includes(newSearchName.toLowerCase()) || email.toLowerCase().includes(newSearchName.toLowerCase())
      )
    })

    setFilteredGuestlistData(filteredData)
  }

  useEffect(() => {
    NetworkManager.get(`/merchants/m/${merchantId}/eventAttendees/${eventId}`).then((res) => {
      console.log(res.data)
      setGuestlistData(res.data)
      setFilteredGuestlistData(res.data)
    })
  }, [eventId, merchantId])

  if (filteredGuestlistData) {
    return (
      <div className="container">
        <TicketCheckerNavBar title="Guestlist" backPath=".." />

        <div className="content">
          <Spacer y={9} />

          <div
            style={{
              display: "flex",
              alignItems: "center",
              height: 48,
              padding: "0 16px 0 8px",
              backgroundColor: Colors.OFF_WHITE_LIGHT,
              overflow: "hidden",
              columnGap: 8,
            }}
          >
            <Discover color={Colors.GRAY_LIGHT} />
            <input
              value={searchName}
              onChange={handleSearchNameChange}
              placeholder="Search name or email"
              style={{
                flexGrow: 10,
                height: "100%",
                backgroundColor: Colors.OFF_WHITE_LIGHT,
              }}
            />
          </div>

          <Spacer y={3} />
          {filteredGuestlistData.map((datum, index) => {
            const {
              productTitle,
              quantity,
              firstName,
              lastName,
              email,
              ticketId,
              earliestEntryAt,
              latestEntryAt,
            } = datum

            const formatTimestamp = (timestamp) =>
              format(dateFromTimestamp(timestamp), "do MMM H:mm")

            let entryTimeMessage = null

            if (earliestEntryAt) {
              if (latestEntryAt) {
                entryTimeMessage = `Entry from ${formatTimestamp(
                  earliestEntryAt
                )} until ${formatTimestamp(latestEntryAt)}.`
              } else {
                entryTimeMessage = `Entry from ${formatTimestamp(
                  earliestEntryAt
                )}.`
              }
            } else if (latestEntryAt) {
              entryTimeMessage = `Entry until ${formatTimestamp(
                latestEntryAt
              )}.`
            }

            const name = `${firstName} ${lastName}`
            const addition = quantity === 1 ? "" : ` +${quantity - 1}`
            return (
              <div key={index}>
                <div
                  style={{
                    backgroundColor: Colors.OFF_WHITE_LIGHT,
                    padding: 16,
                  }}
                >
                  <h4 className="header-xs">
                    {name}
                    {addition}
                  </h4>
                  <Spacer y={2} />
                  <p>{productTitle}</p>
                  <Spacer y={2} />
                  <p>Tickets sent to {email}</p>
                  <Spacer y={1} />
                  {entryTimeMessage && <p>{entryTimeMessage}</p>}
                </div>
                <Spacer y={2} />
              </div>
            )
          })}
        </div>
      </div>
    )
  } else {
    return <LoadingPage />
  }
}
