import { format } from "date-fns"
import { useState } from "react"
import { useLocation } from "react-router-dom"
import Discover from "../../../../assets/icons/Discover"
import LoadingPage from "../../../../components/LoadingPage"
import SmallButton from "../../../../components/SmallButton"
import Spacer from "../../../../components/Spacer"
import { Colors } from "../../../../enums/Colors"
import { dateFromTimestamp } from "../../../../utils/helpers/time"

export default function GuestlistTab({ event, guestlistData }) {
  const [filteredGuestlistData, setFilteredGuestlistData] = useState(guestlistData)
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

    // The download function takes a CSV string, the filename and mimeType as parameters
    // Scroll/look down at the bottom of this snippet to see how download is called
    var download = function (content, fileName, mimeType) {
      var a = document.createElement('a');
      mimeType = mimeType || 'application/octet-stream';

      if (navigator.msSaveBlob) {
        navigator.msSaveBlob(new Blob([content], {
          type: mimeType
        }), fileName);
      } else if (URL && 'download' in a) {
        a.href = URL.createObjectURL(new Blob([content], {
          type: mimeType
        }));
        a.setAttribute('download', fileName);
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      } else {
        location.href = 'data:application/octet-stream,' + encodeURIComponent(content);
      }
    }

    download(csvContent, `${event.title} Guestlist.csv`, 'text/csv;encoding:utf-8');
  }

  if (!event.isPublished) {
    return <p className="text-body-faded">Your event isn't published yet. You'll be able to see your guestlist here once it is.</p>
  } else if (guestlistData.length === 0) {
    return <p className="text-body-faded">No guests yet.</p>
  } else if (filteredGuestlistData) {
    return <div>
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
  } else {
    return <LoadingPage />
  }
}