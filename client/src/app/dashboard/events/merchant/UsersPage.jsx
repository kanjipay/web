import { useEffect, useState } from "react"
import Spacer from "../../../../components/Spacer"
import { useParams } from "react-router-dom"
import { NetworkManager } from "../../../../utils/NetworkManager"
import Collection from "../../../../enums/Collection"
import LoadingPage from "../../../../components/LoadingPage"
import { where } from "firebase/firestore"

export default function UsersPage() {
  const { merchantId } = useParams()
  const [users, setUsers] = useState(null)
  const [invites, setInvites] = useState(null)

  useEffect(() => {
    NetworkManager.get(`/merchants/m/${merchantId}/users`).then((res) => {
      const users = res.data
      console.log(users)
      setUsers(users)
    })
  }, [merchantId])

  useEffect(() => {
    return Collection.INVITE.queryOnChange(
      setInvites,
      where("merchantId", "==", merchantId)
    )
  }, [merchantId])

  if (!invites || !users) {
    return <LoadingPage />
  } else {
    return (
      <div>
        <Spacer y={5} />
        <h1 className="header-l">Users</h1>
        <Spacer y={5} />
      </div>
    )
  }
}
