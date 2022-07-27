import Spacer from "../../../../components/Spacer"
import Form, { generateValidator } from "../../../../components/Form"
import { TextArea } from "../../../../components/Input"
import DatePicker from "../../../../components/DatePicker"
import { IntField } from "../../../../components/input/IntField"
import Breadcrumb from "../../../../components/Breadcrumb"
import { serverTimestamp, setDoc } from "firebase/firestore"
import Collection from "../../../../enums/Collection"
import { useNavigate, useParams } from "react-router-dom"
import { getEventRecurrenceStorageRef, getEventStorageRef } from "../../../../utils/helpers/storage"
import { uploadImage } from "../../../../utils/helpers/uploadImage"
import SimpleImagePicker from "../../../../components/SimpleImagePicker"
import CheckBox from "../../../../components/CheckBox"
import TimeIntervalPicker from "../TimeIntervalPicker"
import { TimeInterval } from "../../../../enums/TimeInterval"
import { v4 as uuid } from "uuid"
import { NetworkManager } from "../../../../utils/NetworkManager"

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
      isRecurring,
      interval,
      eventPublishInterval,
      eventCreateInterval
    } = data

    if (isRecurring) {
      const eventRecurrenceId = uuid()
      const ref = getEventRecurrenceStorageRef(merchantId, eventRecurrenceId, photo.file.name)
      const uploadToStorage = uploadImage(ref, photo.file)

      const createEventRecurrence = NetworkManager.post(`/merchants/m/${merchantId}/eventRecurrences`, {
        eventRecurrenceId,
        data: {
          merchantId,
          title,
          description,
          photo: photo.file.name,
          address,
          startsAt,
          endsAt,
          maxTicketsPerPerson: parseInt(maxTicketsPerPerson, 10),
          interval,
          eventPublishInterval,
          eventCreateInterval
        }
      })

      const [
        createRecurrenceRes
      ] = await Promise([
        createEventRecurrence,
        uploadToStorage
      ])

      navigate(`../er/${eventRecurrenceId}`)
    } else {
      const eventId = uuid()

      const ref = getEventStorageRef(merchantId, eventId, photo.file.name)

      const uploadToStorage =  uploadImage(ref, photo.file)

      const uploadDoc = setDoc(Collection.EVENT.docRef(eventId), {
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
        createdAt: serverTimestamp()
      })

      await Promise.all([
        uploadDoc,
        uploadToStorage,
      ])

      navigate(`../e/${eventId}/p/create`)
    }
  }

  const inFutureValidator = generateValidator(
    (date) => date > new Date(),
    "This date has to be in the future."
  )

  const initialDate = new Date()
  initialDate.setMinutes(0)

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
              startsAt: initialDate,
              endsAt: initialDate,
              maxTicketsPerPerson: 10,
              interval: {
                interval: TimeInterval.WEEK,
                amount: 1,
              },
              eventCreateInterval: {
                interval: TimeInterval.WEEK,
                amount: 4
              },
              eventPublishInterval: {
                interval: TimeInterval.WEEK,
                amount: 2
              },
            }}
            validators={[
              generateValidator(
                (data) => data.startsAt < data.endsAt,
                "The start date of your event must be before the end date."
              ),
            ]}
            formGroupData={data => [
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
                    // {
                    //   name: "isRecurring",
                    //   label: "Make event recurring",
                    //   input: <CheckBox />
                    // },
                    {
                      name: "interval",
                      input: <TimeIntervalPicker prefix="Every" />,
                      validators: [
                        value => {
                          return {
                            isValid: !value || (value.amount >= 1 && value.amount < 100),
                            message: "Frequency must be between 1 and 99"
                          }
                        }
                      ],
                      visible: !!data.isRecurring
                    },
                    {
                      name: "eventPublishInterval",
                      explanation: "How far in advance your event will be published to customers, relative to when it starts.",
                      input: <TimeIntervalPicker prefix="Publish" suffix="before the event starts" />,
                      visible: !!data.isRecurring
                    },
                    {
                      name: "eventCreateInterval",
                      explanation: "How far in advance your event will be created, relative to when it's published to customers.",
                      input: <TimeIntervalPicker prefix="Create" suffix="before publishing the event" />,
                      visible: !!data.isRecurring
                    },
                    {
                      name: "publishScheduledAt",
                      label: "Scheduled publish date",
                      explanation:
                        "Optionally set the time you want to publish this event to customers.",
                      input: <DatePicker />,
                      required: false,
                      visible: !data.isRecurring
                    },
                  ]
                },
              ]
            }
            onSubmit={handleCreateEvent}
            submitTitle="Create event"
          />
          <Spacer y={6} />
      </div>
    </div>
  )
}