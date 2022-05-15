import { format } from "date-fns"
import { Link, useNavigate } from "react-router-dom"
import Discover from "../../assets/icons/Discover"
import { Colors } from "../../components/CircleButton"
import CircleIcon from "../../components/CircleIcon"
import MainButton from "../../components/MainButton"
import Spacer from "../../components/Spacer"
import { dateFromTimestamp } from "../../utils/helpers/time"

export default function SelectOrganisationPage({ memberships }) {
  const navigate = useNavigate()

  const handleCreateOrganisation = () => {
    navigate("/dashboard/organisations/create")
  }

  return <div>
    <Spacer y={12} />
    {
      memberships.length > 0 ?
        <div style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr",
          columnGap: 24,
          rowGap: 24,
          margin: "auto",
          maxWidth: 1080,
          padding: "0 24px"
        }}>
          <Link to={`organisations/create`}>
            <div style={{ padding: 16, backgroundColor: Colors.OFF_WHITE_LIGHT, height: 200 }}>
              <h3 className="header-s">Create new organisation</h3>
            </div>
          </Link>
          {
            memberships.map(membership => {
              return <Link to={`/dashboard/o/${membership.merchantId}`} key={membership.id}>
                <div style={{ padding: 16, backgroundColor: Colors.OFF_WHITE_LIGHT }}>
                  <h3 className="header-s">{membership.merchantName}</h3>
                  <Spacer y={8} />
                  <h4 className="header-xs">Last used:</h4>
                  <Spacer y={1} />
                  <p className="text-body-faded">{format(dateFromTimestamp(membership.lastUsedAt), "dd MMM")}</p>
                </div>
              </Link>
            })
          }
        </div> :
        <div style={{ position: "relative", height: "calc(100vh - 144px)" }}>
          <div className="centred" style={{ maxWidth: 300 }}>
            <CircleIcon Icon={Discover} length={120} style={{ margin: "auto" }} />
            <Spacer y={2} />
            <h3 className="header-s">No organisations</h3>
            <Spacer y={2} />
            <p className="text-body-faded">You're not a member of any organisations yet</p>
            <Spacer y={2} />
            <MainButton title="Create organisation" onClick={handleCreateOrganisation} />
          </div>
        </div>
    }
  </div>
  
}