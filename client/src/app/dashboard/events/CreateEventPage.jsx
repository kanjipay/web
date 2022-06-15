import Spacer from "../../../components/Spacer";
import Form, { generateValidator } from "../../../components/Form";
import { TextArea } from "../../../components/Input";
import DatePicker from "../../../components/DatePicker";
import { IntField } from "../../../components/input/IntField";
import ImagePicker from "../../../components/ImagePicker";
import Breadcrumb from "../../../components/Breadcrumb";
import { addDoc } from "firebase/firestore"
import Collection from "../../../enums/Collection";
import { useNavigate, useParams } from "react-router-dom";
import { getEventStorageRef } from "../../../utils/helpers/storage";
import { uploadImage } from "../../../utils/helpers/uploadImage";

export default function CreateEventPage() {
  const navigate = useNavigate()
  const { merchantId } = useParams()

  const handleCreateEvent = async (data) => {
    const { title, description, photo, address, startsAt, endsAt, maxTicketsPerPerson } = data

    const eventRef = await addDoc(Collection.EVENT.ref, {
      merchantId,
      title,
      description,
      photo: photo.name,
      address,
      startsAt,
      endsAt,
      maxTicketsPerPerson: parseInt(maxTicketsPerPerson, 10),
      isPublished: false
    })

    const eventId = eventRef.id

    const ref = getEventStorageRef(merchantId, eventId, photo.name)

    await uploadImage(ref, photo)

    navigate(`../e/${eventId}`)
  }

  const inFutureValidator = generateValidator(date => date > new Date(), "This date has to be in the future.")

  return <div>
    <Spacer y={2} />
    <Breadcrumb pageData={[
      { title: "Events", path: ".." },
      { title: "Create event" }
    ]} />
    <Spacer y={2} />
    <h1 className="header-l">Create event</h1>
    <Spacer y={3} />
    <div style={{ display: "grid", columnGap: 48, gridTemplateColumns: "1fr 1fr" }}>
      <div>
        <Form
          initialDataSource={{
            startsAt: new Date(),
            endsAt: new Date(),
            maxTicketsPerPerson: 10,
          }}
          validators={[
            generateValidator((data) => data.startsAt < data.endsAt, "The start date of your event must be before the end date.")
          ]}
          formGroupData={[
            {
              explanation: "Your event won't be shown to customers immediately. You'll need to publish it first.",
              items: [
                {
                  name: "title"
                },
                {
                  name: "description",
                  input: <TextArea />
                },
                {
                  name: "photo",
                  input: <ImagePicker />
                },
                {
                  name: "address"
                },
                {
                  name: "startsAt",
                  validators: [inFutureValidator],
                  input: <DatePicker />
                },
                {
                  name: "endsAt",
                  validators: [inFutureValidator],
                  input: <DatePicker />
                },
                {
                  name: "maxTicketsPerPerson",
                  input: <IntField maxChars={3} />
                }

              ]
            }
          ]}
          onSubmit={handleCreateEvent}
          submitTitle="Create event"
        />
        <Spacer y={6} />
      </div>
    </div>
    
  </div>
}