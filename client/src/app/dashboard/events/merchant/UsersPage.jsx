import { useEffect, useState } from "react"
import Spacer from "../../../../components/Spacer"
import { useParams } from "react-router-dom"
import { NetworkManager } from "../../../../utils/NetworkManager"
import Collection from "../../../../enums/Collection"
import LoadingPage from "../../../../components/LoadingPage"
import { where } from "firebase/firestore"
import Form from "../../../../components/Form"
import { setDoc } from "firebase/firestore"
import {v4 as uuid} from "uuid"
import { getDoc } from "firebase/firestore"

import { sendSignInLinkToEmail} from "firebase/auth"
import { auth } from "../../../../utils/FirebaseUtils"


export default function UsersPage() {
  const { merchantId } = useParams()
  const [users, setUsers] = useState(null)
  const [invites, setInvites] = useState(null)

  async function handleInviteUser(data){
    const { email } = data
    const uid = uuid()
    console.log()
    const merchantDoc = await getDoc(Collection.MERCHANT.docRef(merchantId))
    const {displayName} = merchantDoc.data()
    const docRef = Collection.INVITE.docRef(uid)
    console.log({merchantId, email, displayName})
    const invitePromise = setDoc(docRef,{merchantId,displayName ,email})
    const authData = {
      url: `${process.env.REACT_APP_BASE_SERVER_URL}/auth/email-link`,
      handleCodeInApp: true,
    }
    console.log({authData})
    const signinPromise = sendSignInLinkToEmail(auth, email, authData)
    Promise.all([invitePromise,signinPromise])
  }

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
        <Form
      formGroupData={[
        {
          title: "invite a user to your organisation",
          items: [
            {
              name: "email",
              required: true,
            },
          ],
        },
      ]}
      onSubmit={handleInviteUser}
      submitTitle="Send Invite"
    />
      <Spacer y={5} />
      <h2 className="header-m">Current users</h2>

      <Spacer y={5} />
        {
        users.map((datum, index) => {
          const {
            firstName,
            lastName,
            email,
          } = datum
          return <div key={index}>
                  <p>{firstName + ' ' + lastName}</p>
                  <p>{email}</p>
                  <Spacer y={2} />

                </div>
        })}
      </div>
    )
  }
}
