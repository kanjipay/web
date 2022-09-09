import { deleteDoc, serverTimestamp, updateDoc } from "firebase/firestore"
import { deleteObject } from "firebase/storage"
import { useRef } from "react"
import { useNavigate } from "react-router-dom"
import Popup from "reactjs-popup"
import ArrayInput from "../../../../components/ArrayInput"
import { ButtonTheme } from "../../../../components/ButtonTheme"
import DatePicker from "../../../../components/DatePicker"
import Form, { generateValidator } from "../../../../components/Form"
import { TextArea } from "../../../../components/Input"
import { Field, IntField } from "../../../../components/input/IntField"
import MainButton from "../../../../components/MainButton"
import { Modal } from "../../../../components/Modal"
import ResultBanner, { ResultType } from "../../../../components/ResultBanner"
import SimpleImagePicker from "../../../../components/SimpleImagePicker"
import Spacer from "../../../../components/Spacer"
import Collection from "../../../../enums/Collection"
import { getEventStorageRef } from "../../../../utils/helpers/storage"
import { dateFromTimestamp } from "../../../../utils/helpers/time"
import { uploadImage } from "../../../../utils/helpers/uploadImage"

export default function EventDetailsTab({ event, products }) {
  const navigate = useNavigate()
  const docRef = Collection.EVENT.docRef(event.id)
  const publishButtonRef = useRef(null)

  const handleDeleteEvent = async () => {
    await deleteDoc(docRef)
    navigate("../..")
  }

  const handlePublishEvent = async () => {
    await updateDoc(docRef, { isPublished: true, publishedAt: serverTimestamp() })
  }

  function canPublishEvent() {
    return products.length > 0
  }

  const handleUpdateEvent = async (data) => {
    const promises = []
    const file = data.photo?.file
    const storageRef = data.photo?.storageRef

    if (file) {
      const uploadRef = getEventStorageRef(
        event,
        file.name
      )

      data.photo = { storageRef: uploadRef }

      promises.push(uploadImage(uploadRef, file))
    }

    if (!storageRef && event.photo) {
      const existingRef = getEventStorageRef(
        event,
        event.photo
      )

      promises.push(deleteObject(existingRef))
    }

    let uploadData = {
      ...data,
      photo: file?.name ?? event.photo,
      maxTicketsPerPerson: parseInt(data.maxTicketsPerPerson, 10),
    }

    promises.push(updateDoc(docRef, uploadData))

    await Promise.all(promises)

    return {
      resultType: ResultType.SUCCESS,
      message: "Changes saved"
    }
  }

  return <div style={{ maxWidth: 500 }}>
    {
      event.isPublished && <div>
        <ResultBanner 
          resultType={ResultType.INFO} 
          message="This event is published, so if you change the event address or start/end time, we'll email your ticket purchasers."
        />
        <Spacer y={3} />
      </div>
    }
    
    <Form
      initialDataSource={{
        ...event,
        startsAt: dateFromTimestamp(event.startsAt) ?? new Date(),
        endsAt: dateFromTimestamp(event.endsAt) ?? new Date(),
        publishScheduledAt: dateFromTimestamp(event.publishScheduledAt),
        photo: event.photo ? {
          storageRef: getEventStorageRef(
            event,
            event.photo
          ),
        } : {},
        tags: event.tags ?? [],
      }}
      formGroupData={[
        {
          explanation: event.isPublished
            ? "This event is published, so some fields can't be edited, and it can't be deleted."
            : null,
          items: [
            { name: "title" },
            {
              name: "description",
              required: false,
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
              required: false
            },
            {
              name: "address",
            },
            {
              name: "maxTicketsPerPerson",
              input: <IntField maxChars={3} />,
            },
            {
              name: "startsAt",
              input: <DatePicker />,
            },
            {
              name: "endsAt",
              input: <DatePicker />,
            },
            {
              name: "publishScheduledAt",
              label: "Scheduled publish date",
              explanation:
                "Optionally set the time you want to publish this event to customers.",
              input: <DatePicker />,
              required: false,
              disabled: !!event.isPublished || !canPublishEvent(),
            },
          ],
        },
      ]}
      validators={[
        generateValidator(
          (data) => data.startsAt < data.endsAt,
          "The start date of your event must be before the end date."
        ),
      ]}
      onSubmit={handleUpdateEvent}
      submitTitle="Save changes"
    />
    {!event.isPublished && (
      <div ref={publishButtonRef}>
        <Spacer y={2} />

        {canPublishEvent() && (
          <div>
            <Popup
              trigger={
                <div>
                  <MainButton
                    title={
                      event.publishScheduledAt
                        ? "Publish early"
                        : "Publish"
                    }
                    test-id="publish-event-button"
                    buttonTheme={ButtonTheme.MONOCHROME_OUTLINED}
                  />
                </div>
              }
              modal
            >
              {(close) => (
                <Modal>
                  <h2 className="header-m">Are you sure?</h2>
                  <Spacer y={2} />
                  <p className="text-body-faded">
                    Once you publish an event, it'll become visible to
                    customers.
                  </p>
                  <Spacer y={4} />
                  <MainButton
                    title="Publish event"
                    test-id="confirm-publish-event-button"
                    onClick={() => {
                      handlePublishEvent()
                      close()
                    }}
                  />
                  <Spacer y={2} />
                  <MainButton
                    title="Cancel"
                    buttonTheme={ButtonTheme.MONOCHROME_OUTLINED}
                    test-id="cancel-publish-event-button"
                    onClick={close}
                  />
                </Modal>
              )}
            </Popup>
            <Spacer y={2} />
          </div>
        )}

        <Popup
          trigger={
            <div>
              <MainButton
                title="Delete"
                buttonTheme={ButtonTheme.DESTRUCTIVE}
                test-id="delete-event-button"
              />
            </div>
          }
          modal
        >
          {(close) => (
            <Modal>
              <h2 className="header-m">Are you sure?</h2>
              <Spacer y={2} />
              <p className="text-body-faded">
                Deleting events can't be reversed, so you'll have to start
                from scratch if you change your mind.
              </p>
              <Spacer y={4} />
              <MainButton
                title="Delete event"
                buttonTheme={ButtonTheme.DESTRUCTIVE}
                test-id="confirm-delete-event-button"
                onClick={() => {
                  handleDeleteEvent()
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
          )}
        </Popup>
      </div>
    )}
  </div>
}