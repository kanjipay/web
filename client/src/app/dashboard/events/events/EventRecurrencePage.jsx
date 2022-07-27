import Breadcrumb from "../../../../components/Breadcrumb";
import Spacer from "../../../../components/Spacer";
import { Colors } from "../../../../enums/Colors";

export default function EventRecurrencePage({ event }) {
  return <div>
    <Spacer y={5} />
    <Breadcrumb pageData={[
      { title: "Events", path: "../.." },
      { title: event.title, path: ".." },
      { title: "Event schedule" },
    ]} />
    <Spacer y={2} />
    <h1 className="header-l">Event schedule</h1>
    <Spacer y={2} />
    <p style={{ padding: "4px 8px", backgroundColor: Colors.OFF_WHITE_LIGHT, display: "inline" }}>{event.title}</p>
  </div>
}