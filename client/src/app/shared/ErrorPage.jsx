import { useLocation } from "react-router-dom";
import Cross from "../../assets/icons/Cross";
import IconActionPage from "../../components/IconActionPage";
import { Colors } from "../../enums/Colors";

export default function ErrorPage() {
  const { state } = useLocation()
  const { title, body, backPath } = state

  return <IconActionPage 
    Icon={Cross}
    iconBackgroundColor={Colors.RED_LIGHT}
    iconForegroundColor={Colors.RED}
    title={title}
    body={body}
    
  />
}