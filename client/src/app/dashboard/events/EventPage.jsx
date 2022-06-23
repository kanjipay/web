import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Breadcrumb from "../../../components/Breadcrumb";
import { TextArea } from "../../../components/Input";
import Spacer from "../../../components/Spacer";
import MainButton from "../../../components/MainButton";
import DatePicker from "../../../components/DatePicker";
import { dateFromTimestamp } from "../../../utils/helpers/time";
import ProductListing from "./ProductListing";
import Form from "../../../components/Form";
import { Field, IntField } from "../../../components/input/IntField";
import SmallButton from "../../../components/SmallButton";
import { Colors } from "../../../enums/Colors";
import { ButtonTheme } from "../../../components/ButtonTheme";
import { getEventStorageRef } from "../../../utils/helpers/storage";
import { deleteDoc, updateDoc, where } from "firebase/firestore";
import Popup from 'reactjs-popup';
import Collection from "../../../enums/Collection";
import { deleteObject } from "firebase/storage";
import ArrayInput from "../../../components/ArrayInput";
import { uploadImage } from "../../../utils/helpers/uploadImage";
import SimpleImagePicker from "../../../components/SimpleImagePicker";

export function Modal({ children, modalStyle }) {
  return <div
    style={{
      height: "100vh",
      width: "100vw", backgroundColor: "#00000088",
      position: "relative"
    }}
  >
    <div
      className="centred"
      style={{
        backgroundColor: Colors.WHITE,
        padding: 16,
        width: 320,
        boxSizing: "border-box",
        ...modalStyle
      }}
    >
      {children}
    </div>
  </div>
}

export function CopyToClipboardButton({ text }) {
  const [hasCopiedToClipboard, setHasCopiedToClipboard] = useState(false)
  const buttonTitle = hasCopiedToClipboard ? "Copied" : "Copy"

  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(text)
    setHasCopiedToClipboard(true)

    setTimeout(() => setHasCopiedToClipboard(false), 3000)
  }

  return <SmallButton
    title={buttonTitle}
    buttonTheme={ButtonTheme.MONOCHROME_OUTLINED}
    onClick={handleCopyToClipboard}
  />
}

export default function EventPage({ merchant, event, products }) {
  const navigate = useNavigate()
  const docRef = Collection.EVENT.docRef(event.id)
  const { merchantId } = useParams()
  const [attributionLinks, setAttributionLinks] = useState(null)

  const handleUpdateEvent = async (data) => {
    const promises = []
    const file = data.photo?.file

    if (file) {
      data.photo = file.name

      const eventRef = getEventStorageRef(event.merchantId, event.id, file.name)

      promises.push(
        uploadImage(eventRef, file)
      )

      promises.push(
        deleteObject(getEventStorageRef(event.merchantId, event.id, event.photo))
      )
    }

    promises.push(
      updateDoc(docRef, {
        ...data,
        photo: event.photo,
        maxTicketsPerPerson: parseInt(data.maxTicketsPerPerson, 10),
      })
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

  const hasPublishedProducts = products.filter(p => p.isPublished).length > 0

  useEffect(() => {
    Collection.ATTRIBUTION_LINK.queryOnChange(
      setAttributionLinks,
      where("merchantId", "==", merchantId)
    )
  }, [merchantId])

  return <div>
    <Spacer y={2} />
    <Breadcrumb pageData={[
      { title: "Events", path: "../.." },
      { title: event.title },
    ]}/>
    <Spacer y={2} />
    <h1 className="header-l">{event.title}</h1>
    <Spacer y={4} />
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", columnGap: 48 }}>
      <div>
        {
          event.isPublished && <div>
            <h2 className="header-m">Event links</h2>
            <Spacer y={3} />
            <h3 className="header-s">Plain event link</h3>
            <Spacer y={2} />
            <p className="text-body-faded">This is the link customers can use to view your event and buy tickets.</p>
            <Spacer y={2} />
            <div style={{ display: "flex", alignItems: "center", columnGap: 16 }}>
              <a href={eventLinkString} target="_blank" rel="noreferrer" style={{ textDecoration: "underline", fontWeight: "400" }}>{eventLinkString}</a>
              <div className="flex-spacer"></div>
              <CopyToClipboardButton text={eventLinkString} />
            </div>
            <Spacer y={3} />
            <h3 className="header-s">Attribution links</h3>
            <Spacer y={2} />
            <p className="text-body-faded">Want to see which of your marketing efforts is bringing in sales? You can use attribution links to analyse where your sales are coming from.</p>
            {
              attributionLinks && <div>
                <Spacer y={2} />
                {
                  attributionLinks.length > 0 ?
                    attributionLinks.map(link => {
                      const linkUrl = new URL(window.location.href)
                      linkUrl.pathname = `/l/${link.id}`
                      
                      const linkUrlString = linkUrl.href

                      return <div style={{ 
                        padding: 16, 
                        backgroundColor: Colors.OFF_WHITE_LIGHT, 
                        display: "flex", 
                        alignItems: "center", 
                        columnGap: 16,
                        marginBottom: 16
                      }}>
                        <div>
                          <h4 className="header-xs">{link.displayName}</h4>
                          <Spacer y={2} />
                          <div style={{ display: "flex", columnGap: 8 }}>{
                            Object.entries(link.attributionData).map(([key, value]) => <p style={{ 
                              backgroundColor: Colors.OFF_WHITE, 
                              fontSize: 14,
                              padding: "4px 8px"
                            }}>
                              {`${key} = ${value}`}
                            </p>)
                          }</div>
                          <Spacer y={2} />
                          <p>{linkUrlString}</p>
                        </div>
                        <div style={{ flexGrow: 100 }}></div>
                        <CopyToClipboardButton text={linkUrlString} />
                      </div>
                    }) :
                    <p className="text-body">You don't have any attribution links yet</p>
                }
                
              </div>
            }
            <Spacer y={2} />
            <MainButton title="Create attribution link" onClick={() => navigate("create-attribution-link")} />
          </div>
        }

        <Spacer y={4} />
        
        <h2 className="header-m">Event details</h2>
        <Spacer y={3} />
        <Form
          initialDataSource={{
            maxTicketsPerPerson: 10,
            ...event,
            startsAt: dateFromTimestamp(event.startsAt) ?? new Date(),
            endsAt: dateFromTimestamp(event.endsAt) ?? new Date(),
            photo: { storageRef: getEventStorageRef(event.merchantId, event.id, event.photo) },
            tags: event.tags ?? []
          }}
          formGroupData={[
            {
              explanation: event.isPublished ? "This event is published, so some fields can't be edited, and it can't be deleted." : null,
              items: [
                { name: "title" },
                { 
                  name: "description",
                  input: <TextArea />
                },
                {
                  name: "tags",
                  input: <ArrayInput maxItemCount={3} input={<Field />}/>,
                  required: false
                },
                {
                  name: "photo",
                  input: <SimpleImagePicker isRemovable={false} />
                },
                { 
                  name: "address",
                  disabled: !!event.isPublished
                },
                {
                  name: "maxTicketsPerPerson",
                  input: <IntField maxChars={3} />
                },
                {
                  name: "startsAt",
                  input: <DatePicker />,
                  disabled: !!event.isPublished
                },
                {
                  name: "endsAt",
                  input: <DatePicker />,
                  disabled: !!event.isPublished
                },
              ]
            }
          ]}
          onSubmit={handleUpdateEvent}
          submitTitle="Save"
        />
        {
          !event.isPublished && <div>
            <Spacer y={2} />
            <Popup
              trigger={<div><MainButton title="Publish" buttonTheme={ButtonTheme.MONOCHROME_OUTLINED} /></div>}
              modal
            >
              {
                close => hasPublishedProducts ?
                  <Modal>
                  
                    <h2 className="header-m">Are you sure?</h2>
                    <Spacer y={2} />
                    <p className="text-body-faded">Once you publish an event, it'll become visible to customers, and you won't be able to edit the start and end date or address.</p>
                    <Spacer y={4} />
                    <MainButton title="Publish event" onClick={() => {
                      handlePublishEvent()
                      close()
                    }} />
                    <Spacer y={2} />
                    <MainButton title="Cancel" buttonTheme={ButtonTheme.MONOCHROME_OUTLINED} onClick={close} />
                  </Modal> :
                  <Modal>
                    <h2 className="header-m">Can't publish event</h2>
                    <Spacer y={2} />
                    <p className="text-body-faded">You need to create and publish at least one product for this event before you can publish the event itself.</p>
                    <Spacer y={4} />
                    <MainButton title="OK" buttonTheme={ButtonTheme.MONOCHROME_OUTLINED} onClick={close} />
                  </Modal>
              }
            </Popup>
            
            <Spacer y={2} />
            <Popup
              trigger={<div><MainButton title="Delete" buttonTheme={ButtonTheme.DESTRUCTIVE} /></div>}
              modal
            >
              {
                close => <Modal>
                  <h2 className="header-m">Are you sure?</h2>
                  <Spacer y={2} />
                  <p className="text-body-faded">Deleting events can't be reversed, so you'll have to start from scratch if you change your mind.</p>
                  <Spacer y={4} />
                  <MainButton title="Delete event" buttonTheme={ButtonTheme.DESTRUCTIVE} onClick={() => {
                    handleDeleteEvent()
                    close()
                  }} />
                  <Spacer y={2} />
                  <MainButton title="Cancel" buttonTheme={ButtonTheme.MONOCHROME_OUTLINED} onClick={close} />
                </Modal>
              }
              
            </Popup>
            
          </div>
        }
        
        <Spacer y={6} />
        
      </div>
      <div>
        <div style={{ display: "flex", alignItems: "center" }}>
          <h2 className="header-m">Products</h2>
          <div className="flex-spacer"></div>
          <MainButton
            title="Create product"
            onClick={handleCreateProduct}
            style={{padding: "0 16px"}}
          />
        </div>
        <Spacer y={3} />
        <p>Click to edit.</p>
        <Spacer y={3} />
        {
          products.map(product => {
            return <div key={product.id}>
              <ProductListing product={product} currency={merchant.currency} />
              <Spacer y={2} />
            </div>
          })
        }
      </div>
      
    </div>
  </div>
}



