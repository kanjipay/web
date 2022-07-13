import { useEffect, useRef, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import Breadcrumb from "../../../components/Breadcrumb"
import { TextArea } from "../../../components/Input"
import Spacer from "../../../components/Spacer"
import MainButton from "../../../components/MainButton"
import DatePicker from "../../../components/DatePicker"
import { dateFromTimestamp } from "../../../utils/helpers/time"
import ProductListing from "./ProductListing"
import Form from "../../../components/Form"
import { Field, IntField } from "../../../components/input/IntField"
import { Colors } from "../../../enums/Colors"
import { ButtonTheme } from "../../../components/ButtonTheme"
import { getEventStorageRef } from "../../../utils/helpers/storage"
import { deleteDoc, updateDoc, where } from "firebase/firestore"
import Popup from "reactjs-popup"
import Collection from "../../../enums/Collection"
import { deleteObject } from "firebase/storage"
import ArrayInput from "../../../components/ArrayInput"
import { uploadImage } from "../../../utils/helpers/uploadImage"
import SimpleImagePicker from "../../../components/SimpleImagePicker"
import ResultBanner, { ResultType } from "../../../components/ResultBanner"
import { Modal } from "../../../components/Modal"
import { CopyToClipboardButton } from "../../../components/CopyToClipboardButton"

function PublishInfoBanners({ merchant, hasProducts, publishButtonRef }) {
  const navigate = useNavigate()

  const banners = [
    <ResultBanner
      resultType={ResultType.INFO}
      message="This event isn't published yet. You'll need to publish it before it shows to customers."
    />
  ]

  if (!merchant.crezco?.userId) {
    banners.push(<ResultBanner
      resultType={ResultType.INFO}
      message="You'll need to connect a payment method before you can publish this event."
      action={() => {
        navigate(`/dashboard/o/${merchant.id}/connect-crezco`)
      }}
      actionTitle="Connect payments"
    />)
  }

  if (!hasProducts) {
    banners.push(
      <ResultBanner
        resultType={ResultType.INFO}
        message="You need to create at least one ticket type before you can publish this event."
        action={() => {
          navigate("p/create")
        }}
        actionTitle="Create"
      />
    )
  }

  const children = banners.flatMap((banner, index) => {
    if (index === 0) {
      return [banner]
    } else {
      return [
        <Spacer y={2} />,
        banner
      ]
    }
  })

  return <div>
    {children}
  </div>
}

function CopyableUrl({ urlString }) {
  return <div
    style={{ display: "flex", alignItems: "center", columnGap: 16 }}
  >
    <a
      href={urlString}
      target="_blank"
      rel="noreferrer"
      style={{ textDecoration: "underline", fontWeight: "400" }}
    >
      {urlString}
    </a>
    <div className="flex-spacer"></div>
    <CopyToClipboardButton text={urlString} />
  </div>
}

function EventLinkSection({ eventLinkString }) {
  return <div>
    <h3 className="header-s">Plain event link</h3>
    <Spacer y={2} />
    <p className="text-body-faded">
      This is the link customers can use to view your event and buy
      tickets.
    </p>
    <Spacer y={2} />
    <CopyableUrl urlString={eventLinkString} />
  </div>
}

function AttributionLinkSection({ attributionLinks }) {
  const navigate = useNavigate()

  return <div>
    <h3 className="header-s">Attribution links</h3>
    <Spacer y={2} />
    <p className="text-body-faded">
      Want to see which of your marketing efforts is bringing in
      sales? You can use attribution links to analyse where your sales
      are coming from.
    </p>
    {attributionLinks && <div>
      <Spacer y={2} />
      {attributionLinks.length > 0 ? (
        attributionLinks.map((link) => {
          const linkUrl = new URL(window.location.href)
          linkUrl.pathname = `/l/${link.id}`

          const linkUrlString = linkUrl.href

          return (
            <div
              style={{
                padding: 16,
                backgroundColor: Colors.OFF_WHITE_LIGHT,
                display: "flex",
                alignItems: "center",
                columnGap: 16,
                marginBottom: 16,
              }}
            >
              <div>
                <h4 className="header-xs">{link.displayName}</h4>
                <Spacer y={2} />
                <div style={{ display: "flex", columnGap: 8 }}>
                  {Object.entries(link.attributionData).map(
                    ([key, value]) => (
                      <p
                        style={{
                          backgroundColor: Colors.OFF_WHITE,
                          fontSize: 14,
                          padding: "4px 8px",
                        }}
                      >
                        {`${key} = ${value}`}
                      </p>
                    )
                  )}
                </div>
                <Spacer y={2} />
                <p>{linkUrlString}</p>
              </div>
              <div style={{ flexGrow: 100 }}></div>
              <CopyToClipboardButton text={linkUrlString} />
            </div>
          )
        })
      ) : (
        <p className="text-body">
          You don't have any attribution links yet
        </p>
      )}
    </div>}
    <Spacer y={2} />
    <MainButton
      title="Create attribution link"
      onClick={() => navigate("create-attribution-link")}
    />
  </div>
}

export default function EventPage({ merchant, event, products }) {
  const navigate = useNavigate()
  const docRef = Collection.EVENT.docRef(event.id)
  const { merchantId } = useParams()
  const [attributionLinks, setAttributionLinks] = useState(null)
  const publishButtonRef = useRef(null)

  function canPublishEvent() {
    return !!merchant.crezco?.userId && products.length > 0
  }

  const handleUpdateEvent = async (data) => {
    console.log(data)
    const promises = []
    const file = data.photo?.file

    console.log(file)

    if (file) {
      const uploadRef = getEventStorageRef(event.merchantId, event.id, file.name)
      const existingRef = getEventStorageRef(event.merchantId, event.id, event.photo)

      console.log("Upload ref", uploadRef.fullPath)
      console.log("Existing ref", existingRef.fullPath)

      data.photo = { storageRef: uploadRef }

      promises.push(uploadImage(uploadRef, file))

      promises.push(
        deleteObject(existingRef)
      )
    }

    let uploadData = {
      ...data,
      photo: file?.name ?? event.photo,
      maxTicketsPerPerson: parseInt(data.maxTicketsPerPerson, 10),
    }

    console.log("publishScheduledAt", uploadData.publishScheduledAt)

    if (!uploadData.publishScheduledAt) {
      console.log("deleting publishScheduledAt")
      delete uploadData.publishScheduledAt
      console.log(uploadData)
    }

    console.log("upload data", uploadData)

    promises.push(
      updateDoc(docRef, uploadData)
    )

    await Promise.all(promises)
  }

  const handleCreateProduct = () => {
    navigate("p/create")
  }

  const handleDeleteEvent = async () => {
    await deleteDoc(docRef)
    navigate("../..")
  }

  const handlePublishEvent = async () => {
    await updateDoc(docRef, { isPublished: true })
  }

  const eventLink = new URL(window.location.href)
  eventLink.pathname = `/events/${event.merchantId}/${event.id}`
  const eventLinkString = eventLink.href

  useEffect(() => {
    Collection.ATTRIBUTION_LINK.queryOnChange(
      setAttributionLinks,
      where("merchantId", "==", merchantId)
    )
  }, [merchantId])

  return (
    <div>
      <Spacer y={2} />
      <Breadcrumb
        pageData={[
          { title: "Events", path: "../..", testId: "events" },
          { title: event.title },
        ]}
      />
      <Spacer y={2} />
      <h1 className="header-l">{event.title}</h1>
      <Spacer y={4} />
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          columnGap: 48,
        }}
      >
        <div>
          {event.isPublished ? <div>
              <h2 className="header-m">Event links</h2>
              <Spacer y={3} />
              <EventLinkSection eventLinkString={eventLinkString} />
              <Spacer y={3} />
              <AttributionLinkSection attributionLinks={attributionLinks} />
            </div> :
            <div>
              <PublishInfoBanners merchant={merchant} publishButtonRef={publishButtonRef} hasProducts={products.length > 0} />
              
              <Spacer y={4} />
              
              <h2 className="header-m">Preview event</h2>
              <Spacer y={2} />
              <p className="text-body-faded">Visit this link to see a preview of the event.</p>
              <Spacer y={2} />
              <CopyableUrl urlString={eventLinkString} />
            </div>
            
          }

          <Spacer y={3} />

          <h2 className="header-m">Event details</h2>
          <Spacer y={3} />
          <Form
            initialDataSource={{
              maxTicketsPerPerson: 10,
              ...event,
              startsAt: dateFromTimestamp(event.startsAt) ?? new Date(),
              endsAt: dateFromTimestamp(event.endsAt) ?? new Date(),
              publishScheduledAt: dateFromTimestamp(event.publishScheduledAt),
              photo: {
                storageRef: getEventStorageRef(
                  event.merchantId,
                  event.id,
                  event.photo
                ),
              },
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
                    disabled: !!event.isPublished,
                  },
                  {
                    name: "maxTicketsPerPerson",
                    input: <IntField maxChars={3} />,
                  },
                  {
                    name: "startsAt",
                    input: <DatePicker />,
                    disabled: !!event.isPublished,
                  },
                  {
                    name: "endsAt",
                    input: <DatePicker />,
                    disabled: !!event.isPublished,
                  },
                  {
                    name: "publishScheduledAt",
                    label: "Scheduled publish date",
                    explanation:
                      "Optionally set the time you want to publish this event to customers." + (!merchant.crezco ? " You can only do this after you connect a payment method." : ""),
                    input: <DatePicker />,
                    required: false,
                    disabled: !!event.isPublished || !canPublishEvent()
                  },
                ],
              },
            ]}
            onSubmit={handleUpdateEvent}
            submitTitle="Save changes"
          />
          {!event.isPublished && (
            <div ref={publishButtonRef}>
              <Spacer y={2} />
              
              {
                canPublishEvent() && <div>
                  <Popup
                    trigger={
                      <div>
                        <MainButton
                          title={event.publishScheduledAt ? "Publish early" : "Publish"}
                          test-id="publish-event-button"

                          buttonTheme={ButtonTheme.MONOCHROME_OUTLINED}
                        />
                      </div>
                    }
                    modal
                  >
                    {(close) => <Modal>
                      <h2 className="header-m">Are you sure?</h2>
                      <Spacer y={2} />
                      <p className="text-body-faded">
                        Once you publish an event, it'll become visible to
                        customers, and you won't be able to edit the start and
                        end date or address.
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
                    </Modal>}
                  </Popup>
                  <Spacer y={2} />
                </div>
              }

              
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

          <Spacer y={6} />
        </div>
        <div>
          <div style={{ display: "flex", alignItems: "center" }}>
            <h2 className="header-m">Ticket types</h2>
            <div className="flex-spacer"></div>
            <MainButton
              title="Create ticket type"
              onClick={handleCreateProduct}
              test-id="create-product-button"
              style={{ padding: "0 16px" }}
            />
          </div>
          <Spacer y={3} />
          {
            products.length > 0 ?
              <div>
                <p>Click to edit.</p>
                <Spacer y={3} />
                {products.map((product) => {
                  return (
                    <div key={product.id}>
                      <ProductListing
                        product={product}
                        currency={merchant.currency}
                      />
                      <Spacer y={2} />
                    </div>
                  )
                })}
              </div> :
              <div>
                <p>You don't have any ticket types for this event yet. You'll need at least one before you can publish the event.</p>
              </div>
          }
          
        </div>
      </div>
    </div>
  )
}
