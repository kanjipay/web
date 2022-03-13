import { useNavigate } from "react-router-dom";
import Tick from "../../../assets/icons/Tick";
import { Colors } from "../../../components/CircleButton";
import IconActionPage from "../../../components/IconActionPage";

export default function EmailSubmittedPage() {
  const navigate = useNavigate();

  return (
    <IconActionPage
      Icon={Tick}
      iconBackgroundColor={Colors.PRIMARY_LIGHT}
      iconForegroundColor={Colors.PRIMARY}
      title="Emailed submitted"
      body="We'll email your receipt shortly"
      primaryActionTitle="Done"
      primaryAction={() => navigate("../..")}
    />
  );
}
