import Spacer from "../../../components/Spacer"
import Form, { generateValidator } from "../../../components/Form"
import { TextArea } from "../../../components/Input"
import DatePicker from "../../../components/DatePicker"
import { IntField } from "../../../components/input/IntField"
import Breadcrumb from "../../../components/Breadcrumb"
import { addDoc } from "firebase/firestore"
import Collection from "../../../enums/Collection"
import { useNavigate, useParams } from "react-router-dom"
import { getEventStorageRef } from "../../../utils/helpers/storage"
import { uploadImage } from "../../../utils/helpers/uploadImage"
import SimpleImagePicker from "../../../components/SimpleImagePicker"
import { isMobile } from "react-device-detect"

export default function CreateEventPage() {
  const navigate = useNavigate()
  const { merchantId } = useParams()

  const handleCreateEvent = async (data) => {
    const {
      title,
      description,
      photo,
      address,
      startsAt,
      endsAt,
      maxTicketsPerPerson,
      publishScheduledAt,
    } = data

    const eventRef = await addDoc(Collection.EVENT.ref, {
      merchantId,
      title,
      description,
      photo: photo.file.name,
      address,
      startsAt,
      endsAt,
      maxTicketsPerPerson: parseInt(maxTicketsPerPerson, 10),
      isPublished: false,
      publishScheduledAt: publishScheduledAt ?? null,
    })

    const eventId = eventRef.id

    const ref = getEventStorageRef(merchantId, eventId, photo.file.name)

    await uploadImage(ref, photo.file)

    navigate(`../e/${eventId}`)
  }

  const inFutureValidator = generateValidator(
    (date) => date > new Date(),
    "This date has to be in the future."
  )

  return (
    <div>
      <Spacer y={2} />
      <Breadcrumb
        pageData={[{ title: "Events", path: ".." }, { title: "Create event" }]}
      />
      <Spacer y={2} />
      <h1 className="header-l">Create event</h1>
      <Spacer y={3} />
      <div
        style={{
          maxWidth: 500
        }}
      >
          <Form
            initialDataSource={{
              startsAt: new Date(),
              endsAt: new Date(),
              maxTicketsPerPerson: 10,
            }}
            validators={[
              generateValidator(
                (data) => data.startsAt < data.endsAt,
                "The start date of your event must be before the end date."
              ),
            ]}
            formGroupData={[
              {
                explanation:
                  "Your event won't be shown to customers immediately. You'll need to publish it first.",
                items: [
                  {
                    name: "title",
                  },
                  {
                    name: "description",
                    input: <TextArea />,
                  },
                  {
                    name: "photo",
                    input: <SimpleImagePicker />,
                  },
                  {
                    name: "address",
                  },
                  {
                    name: "startsAt",
                    validators: [inFutureValidator],
                    input: <DatePicker />,
                  },
                  {
                    name: "endsAt",
                    validators: [inFutureValidator],
                    input: <DatePicker />,
                  },
                  {
                    name: "maxTicketsPerPerson",
                    input: <IntField maxChars={3} />,
                  },
                  {
                    name: "publishScheduledAt",
                    label: "Scheduled publish date",
                    explanation:
                      "Optionally set the time you want to publish this event to customers.",
                    input: <DatePicker />,
                    required: false,
                  },
                ],
              },
            ]}
            onSubmit={handleCreateEvent}
            submitTitle="Create event"
          />
          <Spacer y={6} />
      </div>
    </div>
  )
}
