import { addDoc } from "firebase/firestore"
import { useNavigate, useParams } from "react-router-dom"
import Breadcrumb from "../../../../components/Breadcrumb"
import Form from "../../../../components/Form"
import Spacer from "../../../../components/Spacer"
import Collection from "../../../../enums/Collection"

export default function CreateAttributionLinkPage({ eventRecurrence }) {
  const { eventRecurrenceId, merchantId } = useParams()
  const navigate = useNavigate()

  const handleCreateAttributionLink = async (data) => {
    const { displayName, source, campaign } = data

    await addDoc(Collection.ATTRIBUTION_LINK.ref, {
      createdAt: new Date(),
      eventRecurrenceId,
      merchantId,
      displayName,
      path: `/events/${merchantId}/er/${eventRecurrenceId}`,
      attributionData: {
        source,
        campaign,
      },
    })

    navigate(`/dashboard/o/${merchantId}/events/er/${eventRecurrenceId}`)
  }

  return (
    <div>
      <Spacer y={2} />
      <Breadcrumb pageData={[
        { title: "Event Schedules", path: "../.." },
        { title: eventRecurrence.title, path: ".." },
        { title: "Attribtion" },
      ]} />
      <Spacer y={2} />
      <h1 className="header-l">Create attribution link</h1>
      <Spacer y={2} />
      <div style={{ maxWidth: 500 }}>
        <Form
          formGroupData={[
            {
              explanation:
                'You can use attribution links to analyse where your sales are coming from. For example, you could create a link with source "Instagram" and put it in your Instagram bio.',
              items: [
                { name: "displayName" },
                { name: "source" },
                { name: "campaign" },
              ],
            },
          ]}
          onSubmit={handleCreateAttributionLink}
          submitTitle="Create link"
        />
        <Spacer y={9} />
      </div>
    </div>
  )
}
