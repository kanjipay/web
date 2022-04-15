import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import LoadingPage from "../../components/LoadingPage";
import { fetchLink, acceptLink } from "../../utils/services/LinksService";

export default function OneTimeLinkPage() {
  const { linkId } = useParams()
  const [isInvalid, setIsInvalid] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    fetchLink(linkId).then(link => {
      const { path, wasUsed, expiresAt } = link
      const isValid = expiresAt < new Date() && !wasUsed

      if (isValid) {
        acceptLink(link).then(() => {
          navigate(path)
        })
      } else {
        setIsInvalid(true)
      }
    }).catch(err => {
      console.log("Doesn't exist")
    })
  }, [linkId, navigate])
  return isInvalid ?
    <div>
      Link expired
    </div> :
    <LoadingPage />
}