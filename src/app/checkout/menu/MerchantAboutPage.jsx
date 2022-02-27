import { useLocation } from "react-router-dom";
import Spacer from "../../../components/Spacer";
import { formatMinutes, getWeekdays } from "../../../utils/helpers/time";

export default function MerchantAboutPage() {
  const location = useLocation()
  const { merchant, openHourRanges } = location.state

  const weekdays = getWeekdays('en-GB');
  return (
    <div className="MerchantAboutPage container">
      <Spacer y={3} />
      <h1 className="header-l">{merchant.display_name}</h1>
      <Spacer y={1} />
      <p className="text-body">{merchant.tags.join(" · ")}</p>
      <Spacer y={3} />
      <p className="text-body">{merchant.address}</p>
      <Spacer y={2} />
      <h3 className="header-s">Opening hours</h3>
      <Spacer y={1} />
      {
        openHourRanges
          .sort((range1, range2) => range1.day_of_week - range2.day_of_week)
          .map(range => {
            const weekday = weekdays[range.day_of_week - 1]

            return <div>
              <h4 className="header-xs">{weekday}</h4>
              <Spacer y={0.5} />
              <p className="text-caption">{`${formatMinutes(range.open_time)} - ${formatMinutes(range.close_time)}`}</p>
              <Spacer y={1} />
            </div>
          })
      }
      <Spacer y={3} />
      <p className="text-disclaimer">
        This is a short disclaimer that needs to be here. This is a short disclaimer that needs to be here. This is a short disclaimer that needs to be here. This is a short disclaimer that needs to be here. This is a short disclaimer that needs to be here. This is a short disclaimer that needs to be here. This is a short disclaimer that needs to be here.
      </p>
    </div>
  )
}

