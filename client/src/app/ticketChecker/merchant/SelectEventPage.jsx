import { useNavigate } from "react-router-dom"
import Spacer from "../../../components/Spacer"
import { MenuItem } from "../../dashboard/events/analytics/AnalyticsPage"
import TicketCheckerNavBar from "../TicketCheckerNavBar"

export default function SelectEventPage({ events }) {
  const navigate = useNavigate()

  return (
    <div className="container">
      <TicketCheckerNavBar title="Select event" back="../.." />
      <div className="content" style={{ padding: 0 }}>
        <Spacer y={9} />
        <p className="text-body-faded" style={{ textAlign: "center" }}>
          Select the event you want to scan tickets for.
        </p>
        <Spacer y={3} />
        {events.map((event) => (
          <MenuItem
            key={event.id}
            onClick={() => navigate(event.id)}
            title={event.title}
          />
        ))}
      </div>
    </div>
  )
}
