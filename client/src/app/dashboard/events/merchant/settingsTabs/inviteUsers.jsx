
import { useParams } from "react-router-dom"
import Form from "../../../../../components/Form"
import Spacer from "../../../../../components/Spacer"
import { Field } from "../../../../../components/input/IntField"
import { NetworkManager } from "../../../../../utils/NetworkManager"
import { useState, useEffect } from "react"
import Spinner from "../../../../../assets/Spinner"
import { sendSignInLinkToEmail } from "firebase/auth"
import Collection from "../../../../../enums/Collection"
import v4 from "uuid/dist/v4"
const handleInviteUser = async (email, merchantId) => {
    const inviteId = v4();
    Collection.MERCHANT.docRef(inviteId) = {
        email, 
        merchantId, 
    }
    console.log({email,merchantId})
  }

export function InviteUsersTab({ merchant }) {
    const { merchantId } = useParams()
    console.log({merchantId})
    const [users, setUsers] = useState([])
  
    useEffect(() => {
      NetworkManager.get(`/merchants/m/${merchantId}/users`).then((res) => {
        const userData = res.data
        console.log(userData)
        setUsers(userData)
      })
    }, [merchantId])

return <div style={{ maxWidth: 500 }}>
            <h4 className="header-xs">Current Users</h4>
            <Spacer y={3} />
            {console.log(users)}
            {console.log('here')}
            {users.forEach((user) => {
                <div>
                    <p>user.email</p>    
                    <Spacer y={2} />
                </div>
            })}
            <Form
                formGroupData={[
            {
                title: "New user",
                items: [
                {
                    name: "email",
                    explanation:
                    "Email address of user",
                    input: <Field />,
                    disabled: false,
                },
                ],
            },
            ]}
            submitTitle="Send invite"
            onSubmit={handleInviteUser}/>
        </div>
}