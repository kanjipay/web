import { format } from "date-fns"
import { useEffect, useState } from "react"
import { useLocation, useParams } from "react-router-dom"
import Discover from "../../../assets/icons/Discover"
import LoadingPage from "../../../components/LoadingPage"
import SmallButton from "../../../components/SmallButton"
import Spacer from "../../../components/Spacer"
import { Colors } from "../../../enums/Colors"
import { dateFromTimestamp } from "../../../utils/helpers/time"
import { NetworkManager } from "../../../utils/NetworkManager"
import { download } from "../../dashboard/events/events/GuestlistTab"
import TicketCheckerNavBar from "../TicketCheckerNavBar"

export default function GuestlistPage({ event }) {
  const { eventId, merchantId } = useParams()
  const [guestlistData, setGuestlistData] = useState(null)
  const [filteredGuestlistData, setFilteredGuestlistData] = useState(null)
  const [searchName, setSearchName] = useState(null)
  const location = useLocation()

  const handleSearchNameChange = (event) => {
    const newSearchName = event.target.value

    setSearchName(newSearchName)

    const filteredData = guestlistData.filter((datum) => {
      const { firstName, lastName, email } = datum

      const name = `${firstName} ${lastName}`

      return (
        name.toLowerCase().includes(newSearchName.toLowerCase()) ||
        email.toLowerCase().includes(newSearchName.toLowerCase())
      )
    })

    setFilteredGuestlistData(filteredData)
  }

  const handleDownloadGuestlist = () => {
    const data = [
      ["First name", "Last name", "Email", "Ticket type", "Quantity"],
      ...guestlistData
        .sort((d1, d2) => d1.lastName?.localeCompare(d2.lastName ?? "0") ?? -1)
        .map(d => [d.firstName, d.lastName, d.email, d.productTitle, d.quantity])
        
    ]

    // Building the CSV from the Data two-dimensional array
    // Each column is separated by ";" and new line "\n" for next row
    var csvContent = '';
    data.forEach(function (infoArray, index) {
      const dataString = infoArray.join(',');
      csvContent += index < data.length ? dataString + '\n' : dataString;
    });

    download(location, csvContent, `${event.title} Guestlist.csv`, 'text/csv;encoding:utf-8');
  }

  useEffect(() => {
    NetworkManager.get(
      `/merchants/m/${merchantId}/eventAttendees/${eventId}`
    ).then((res) => {
      setGuestlistData(res.data)
      setFilteredGuestlistData(res.data)
    })
  }, [eventId, merchantId])

  if (filteredGuestlistData) {
    return (
      <div className="container">
        <TicketCheckerNavBar title="Guestlist" back=".." />

        <div className="content">
          <Spacer y={9} />

          <div style={{ display: "flex", columnGap: 8 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                height: 48,
                padding: "0 16px 0 8px",
                backgroundColor: Colors.OFF_WHITE_LIGHT,
                overflow: "hidden",
                columnGap: 8,
                flexGrow: 100
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

            <SmallButton 
              title="Export CSV"
              onClick={handleDownloadGuestlist}
              style={{ height: 48 }}
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
