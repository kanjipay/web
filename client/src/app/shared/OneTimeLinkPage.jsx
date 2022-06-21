import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Cross from "../../assets/icons/Cross";
import { Colors } from "../../enums/Colors";
import IconPage from "../../components/IconPage";
import LoadingPage from "../../components/LoadingPage";
import { fetchLink, acceptLink } from "../../utils/services/LinksService";

export default function OneTimeLinkPage() {
  const { linkId } = useParams()
  const [isInvalid, setIsInvalid] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    fetchLink(linkId).then(link => {
      const { path } = link
      acceptLink(link).then(() => {
        navigate(path)
      })
    }).catch(err => {
      console.log(err)
      setIsInvalid(true)
    })
  }, [linkId, navigate])

  return isInvalid ?
    <IconPage
      Icon={Cross}
      iconBackgroundColor={Colors.RED_LIGHT}
      iconForegroundColor={Colors.RED}
      title="Invalid link"
      body="Either the link has expired, or it's been used already."
    /> :
    <LoadingPage />
}