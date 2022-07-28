import { useNavigate, useParams } from "react-router-dom";
import Breadcrumb from "../../../../components/Breadcrumb";
import LoadingPage from "../../../../components/LoadingPage";
import Spacer from "../../../../components/Spacer";
import TabControl from "../../../../components/TabControl";
import Form from "../../../../components/Form"
import { updateDoc } from "firebase/firestore";
import Collection from "../../../../enums/Collection";
import TimeIntervalPicker from "../../../../components/TimeIntervalPicker";
import { getEventRecurrenceStorageRef } from "../../../../utils/helpers/storage";
import { TextArea } from "../../../../components/Input";
import ArrayInput from "../../../../components/ArrayInput";
import { Field, IntField } from "../../../../components/input/IntField";
import SimpleImagePicker from "../../../../components/SimpleImagePicker";
import MainButton from "../../../../components/MainButton";
import { NetworkManager } from "../../../../utils/NetworkManager";
import { uploadImage } from "../../../../utils/helpers/uploadImage";
import { deleteObject } from "firebase/storage";
import ProductRecurrenceListing from "../productRecurrences/ProductRecurrenceListing";
import { CopyableUrl } from "../events/EventPage";
import Popup from "reactjs-popup";
import { ButtonTheme } from "../../../../components/ButtonTheme";
import { Modal } from "../../../../components/Modal";

export default function EventRecurrencePage({ eventRecurrence, productRecurrences, merchant }) {
  const { eventRecurrenceId, merchantId } = useParams()
  const navigate = useNavigate()

  const handleSaveSchedule = async data => {
    await updateDoc(Collection.EVENT_RECURRENCE.docRef(eventRecurrenceId), data)
  }

  const handleSaveEventDetails = async data => {
    // Call the event recurrence update endpoint
    const promises = []
    const file = data.photo?.file

    if (file) {
      const uploadRef = getEventRecurrenceStorageRef(
        merchantId,
        eventRecurrence.id,
        file.name
      )
      const existingRef = getEventRecurrenceStorageRef(
        merchantId,
        eventRecurrence.id,
        eventRecurrence.photo
      )

      data.photo = { storageRef: uploadRef }

      promises.push(uploadImage(uploadRef, file))
      promises.push(deleteObject(existingRef))
    }

    const updateRecurrence = NetworkManager.put(`/merchants/m/${merchantId}/eventRecurrences/${eventRecurrenceId}`, {
      ...data,
      photo: file?.name ?? eventRecurrence.photo,
      maxTicketsPerPerson: parseInt(data.maxTicketsPerPerson, 10),
    })

    promises.push(updateRecurrence)

    await Promise.all(promises)
  }

  const handleDeleteEventSchedule = async () => {
    await NetworkManager.delete(`/merchants/m/${merchantId}/eventRecurrences/${eventRecurrenceId}`)

    navigate("/dashboard/events")
  }

  const handleCreateTicketType = () => navigate("pr/create")

  const scheduleTab = <div style={{ maxWidth: 500 }}>
    <Form
      initialDataSource={{ ...eventRecurrence }}
      formGroupData={[
        {
          explanation: "Changing the schedule will only affect the creation and publishing of future events. If an event is already created it'll stay as it is.",
          items: [
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
            },
            {
              name: "eventPublishInterval",
              explanation: "How far in advance your event will be published to customers, relative to when it starts.",
              input: <TimeIntervalPicker prefix="Publish" suffix="before the event starts" />,
            },
            {
              name: "eventCreateInterval",
              explanation: "How far in advance your event will be created, relative to when it's published to customers.",
              input: <TimeIntervalPicker prefix="Create" suffix="before publishing the event" />,
            },
          ]
        }
      ]}
      onSubmit={handleSaveSchedule}
      submitTitle="Save changes"
    />
  </div>

  const eventDetailsTab = <div style={{ maxWidth: 500 }}>
    <Form
      initialDataSource={{
        ...eventRecurrence,
        photo: {
          storageRef: getEventRecurrenceStorageRef(merchantId, eventRecurrenceId, eventRecurrence.photo)
        },
        tags: eventRecurrence.tags ?? []
      }}
      formGroupData={[
        {
          items: [
            { name: "title" },
            {
              name: "description",
              input: <TextArea />,
            },
            {
              name: "tags",
              input: <ArrayInput maxItemCount={3} input={<Field />} />,
              required: false,
            },
            {
              name: "photo",
              input: <SimpleImagePicker isRemovable={false} />,
            },
            {
              name: "address",
            },
            {
              name: "maxTicketsPerPerson",
              input: <IntField maxChars={3} />,
            },
          ]
        }
      ]}
      onSubmit={handleSaveEventDetails}
      submitTitle="Save changes"
    />
    <Spacer y={2} />
    <Popup
      trigger={
        <MainButton
          title="Delete event schedule"
          buttonTheme={ButtonTheme.DESTRUCTIVE}
          test-id="delete-event-button"
        />
      }
      modal
    >
      {
        close => <Modal>
          <h2 className="header-m">Are you sure?</h2>
          <Spacer y={2} />
          <p className="text-body-faded">
            Deleting event schedules can't be reversed, so you'll have to start
            from scratch if you change your mind.
          </p>
          <Spacer y={4} />
          <MainButton
            title="Delete event schedule"
            buttonTheme={ButtonTheme.DESTRUCTIVE}
            test-id="confirm-delete-event-button"
            onClick={() => {
              handleDeleteEventSchedule()
              close()
            }}
          />
          <Spacer y={2} />
          <MainButton
            title="Cancel"
            buttonTheme={ButtonTheme.MONOCHROME_OUTLINED}
            test-id="cancel-delete-event-button"
            onClick={close}
          />
        </Modal>
      }
    </Popup>
  </div>

  const ticketTypesTab = productRecurrences ? 
    <div style={{ maxWidth: 500 }}>
      {
        productRecurrences.length > 0 ?
          <div>
            <MainButton 
              title="Create new ticket type"
              onClick={handleCreateTicketType}
            />
            <Spacer y={3} />

            {
              productRecurrences.map(pr => <div key={pr.id}>
                <ProductRecurrenceListing
                  productRecurrence={pr}
                  currency={merchant.currency}
                />
              </div>)
            }
          </div> :
          <div>
            <p className="text-body-faded">You don't have any ticket types yet.</p>
            <Spacer y={2} />
            <MainButton 
              title="Create new ticket type"
              onClick={handleCreateTicketType}
            />
          </div>
      }
    </div> :
    <LoadingPage />

  const eventLink = new URL(window.location.href)
  eventLink.pathname = `/events/${merchantId}/er/${eventRecurrenceId}`
  const eventLinkString = eventLink.href

  const eventLinkTab = <div>
    <div style={{ maxWidth: 500 }}>
      <h3 className="header-s">Event link</h3>
      <Spacer y={2} />
      <p className="text-body-faded">
        This is the link customers can use to view your upcoming event on this schedule.
      </p>
      <Spacer y={2} />
      <CopyableUrl urlString={eventLinkString} />
    </div>
  </div>

  if (eventRecurrence) {
    return <div>
      <Spacer y={2} />
      <Breadcrumb pageData={[
        { title: "Event Schedules", path: "../.." },
        { title: eventRecurrence.title },
      ]} />
      <Spacer y={2} />
      <h1 className="header-l">{eventRecurrence.title}</h1>
      <Spacer y={2} />
      <TabControl 
        name="event-recurrence"
        tabs={{
          "Schedule": scheduleTab,
          "Event details": eventDetailsTab,
          "Ticket types": ticketTypesTab,
          "Event link": eventLinkTab
        }}
      />
      <Spacer y={9} />
    </div>
  } else {
    return <LoadingPage />
  }

  
}