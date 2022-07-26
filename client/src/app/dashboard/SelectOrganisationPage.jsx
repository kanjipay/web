import { format } from "date-fns"
import { Link, useNavigate } from "react-router-dom"
import Discover from "../../assets/icons/Discover"
import Plus from "../../assets/icons/Plus"
import { Colors } from "../../enums/Colors"
import CircleIcon from "../../components/CircleIcon"
import MainButton from "../../components/MainButton"
import Spacer from "../../components/Spacer"
import { dateFromTimestamp } from "../../utils/helpers/time"
import { isMobile } from "react-device-detect"

export default function SelectOrganisationPage({ memberships }) {
  const navigate = useNavigate()

  const handleCreateOrganisation = () => {
    navigate("/dashboard/o/create")
  }

  const boxStyle = {
    padding: 32,
    boxSizing: "border-box",
    backgroundColor: Colors.OFF_WHITE_LIGHT,
    height: 200,
  }

  return memberships.length > 0 ? (
    <div style={{ position: "relative" }}>
      <img
        alt=""
        src="/img/club_floor.jpg"
        style={{
          position: "absolute",
          width: "100%",
          zIndex: 0,
          height: 360,
          objectFit: "cover",
        }}
      />
      <div
        style={{
          width: isMobile ? "100%" : 960,
          padding: isMobile ? "0 16px" : 0,
          boxSizing: "border-box",
          position: "absolute",
          left: "50%",
          top: isMobile ? 100 : 140,
          transform: "translate(-50%, 0)",
          zIndex: 40,
        }}
      >
        <h1 className="header-l" style={{ color: Colors.WHITE }}>
          Your organisations
        </h1>
        <Spacer y={3} />
        <div
          style={{
            display: "grid",
            gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr 1fr",
            columnGap: 24,
            rowGap: 24,
          }}
        >
          <Link
            to={`/dashboard/o/create`}
            test-id="create-organisation-button"
          >
            <div
              style={{ ...boxStyle, display: "flex", alignItems: "center" }}
            >
              <div style={{ textAlign: "center", width: "100%" }}>
                <Plus />
                <p className="header-s">Create organisation</p>
              </div>
            </div>
          </Link>
          {memberships.map((membership) => {
            return (
              <Link
                to={`/dashboard/o/${membership.merchantId}`}
                key={membership.id}
              >
                <div style={{ ...boxStyle }}>
                  <h3 className="header-s">{membership.merchantName}</h3>
                  <p className="text-body-faded">
                    Last used{" "}
                    {format(
                      dateFromTimestamp(membership.lastUsedAt),
                      "d MMM"
                    )}
                  </p>
                </div>
              </Link>
            )
          })}
        </div>
        <Spacer y={9} />
      </div>
    </div>
  ) : (
    <div style={{ position: "relative", height: "calc(100vh - 56px)" }}>
      <div className="centred" style={{ maxWidth: 300 }}>
        <CircleIcon Icon={Discover} length={120} style={{ margin: "auto" }} />
        <Spacer y={2} />
        <h3 className="header-s">No organisations</h3>
        <Spacer y={2} />
        <p className="text-body-faded">
          You're not a member of any organisations. You'll need to create or be
          invited to one before you can start organising events.
        </p>
        <Spacer y={2} />
        <MainButton
          title="Create an organisation"
          onClick={handleCreateOrganisation}
        />
      </div>
    </div>
  )
}
