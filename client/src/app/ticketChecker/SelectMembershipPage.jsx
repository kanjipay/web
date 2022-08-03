import { useNavigate } from "react-router-dom"
import Spacer from "../../components/Spacer"
import { MenuItem } from "../dashboard/events/analytics/MenuItem"
import TicketCheckerNavBar from "./TicketCheckerNavBar"

export default function SelectMembershipPage({ memberships }) {
  const navigate = useNavigate()

  return (
    <div className="container">
      <TicketCheckerNavBar title="Select organisation" />
      <div className="content" style={{ padding: 0 }}>
        <Spacer y={9} />
        <p className="text-body-faded" style={{ textAlign: "center" }}>
          Choose the organisation you want to scan tickets for.
        </p>
        <Spacer y={3} />
        {memberships.map((membership) => (
          <MenuItem
            key={membership.id}
            title={membership.merchantName}
            showsArrow
            onClick={() => navigate(membership.merchantId)}
          />
        ))}
      </div>
    </div>
  )
}
