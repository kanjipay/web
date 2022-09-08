import Spacer from "../../../../components/Spacer"
import Form, { generateValidator } from "../../../../components/Form"
import DatePicker from "../../../../components/DatePicker"
import Breadcrumb from "../../../../components/Breadcrumb"
import { getDocs, query, serverTimestamp, setDoc, where } from "firebase/firestore"
import Collection from "../../../../enums/Collection"
import { useNavigate, useParams } from "react-router-dom"
import CheckBox from "../../../../components/CheckBox"
import TimeIntervalPicker from "../../../../components/TimeIntervalPicker"
import { TimeInterval } from "../../../../enums/TimeInterval"
import { v4 as uuid } from "uuid"
import { NetworkManager } from "../../../../utils/NetworkManager"

export default function CreateEventPage() {
  const navigate = useNavigate()
  const { merchantId } = useParams()

  const handleCreateEvent = async (data) => {
    const {
      title,
      address,
      startsAt,
      endsAt,
      isRecurring,
      interval,
      eventPublishInterval,
      eventCreateInterval
    } = data

    const eventQuery = query(
      Collection.EVENT.ref,
      where("title", "==", title),
      where("merchantId", "==", merchantId)
    )

    const eventSnapshot = await getDocs(eventQuery)

    const eventCount = eventSnapshot.docs.length
    const encodedTitle = title.toLowerCase().replace(/[ /]/g, "-").replace(/[^a-z0-9-]/g, "")
    const linkName = eventCount > 0 ? `${encodedTitle}-${eventCount}` : encodedTitle

    if (isRecurring) {
      const eventRecurrenceId = uuid()

      await NetworkManager.post(`/merchants/m/${merchantId}/eventRecurrences`, {
        eventRecurrenceId,
        data: {
          merchantId,
          title,
          address,
          startsAt,
          endsAt,
          maxTicketsPerPerson: 10,
          interval,
          eventPublishInterval,
          eventCreateInterval
        }
      })

      navigate(`../er/${eventRecurrenceId}`)
    } else {
      const eventId = uuid()

      const uploadDoc = setDoc(Collection.EVENT.docRef(eventId), {
        merchantId,
        title,
        address,
        startsAt,
        linkName,
        endsAt,
        maxTicketsPerPerson: 10,
        isPublished: false,
        createdAt: serverTimestamp()
      })

      await uploadDoc

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
              isRecurring: false,
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
                      name: "isRecurring",
                      label: "Make event recurring",
                      input: <CheckBox />
                    },
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
