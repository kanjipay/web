import { useState } from "react";
import { useNavigate } from "react-router-dom";
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
import { ButtonTheme, Colors } from "../../../components/CircleButton";
import ImagePicker from "../../../components/ImagePicker";
import { getEventStorageRef } from "../../../utils/helpers/storage";
import { deleteDoc, updateDoc } from "firebase/firestore";
import Popup from 'reactjs-popup';
import Collection from "../../../enums/Collection";
import { deleteObject, uploadBytes } from "firebase/storage";
import ArrayInput from "../../../components/ArrayInput";

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

export default function EventPage({ event, products }) {
  const navigate = useNavigate()
  const docRef = Collection.EVENT.docRef(event.id)

  const handleUpdateEvent = async (data) => {
    console.log(data)

    const promises = []

    if (data.photo instanceof File) {
      const file = data.photo
      data.photo = file.name

      promises.push(
        uploadBytes(getEventStorageRef(event.merchantId, event.id, file.name), file, {
          cacheControl: "public,max-age=3600000"
        })
      )

      promises.push(
        deleteObject(getEventStorageRef(event.merchantId, event.id, event.photo))
      )
    } else {
      delete data.photo
    }

    promises.push(
      updateDoc(docRef, {
        ...data,
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
            <h2 className="header-m">Event link</h2>
            <Spacer y={3} />
            <p className="text-body-faded">This is the link customers can use to view your event and buy tickets.</p>
            <Spacer y={2} />
            <div style={{ display: "flex", alignItems: "center", columnGap: 16 }}>
              <a href={eventLinkString} target="_blank" rel="noreferrer" style={{ textDecoration: "underline", fontWeight: "400" }}>{eventLinkString}</a>
              <div className="flex-spacer"></div>
              <CopyToClipboardButton text={eventLinkString} />
            </div>
            <Spacer y={4} />
          </div>
        }
        
        <h2 className="header-m">Event details</h2>
        <Spacer y={3} />
        <Form
          initialDataSource={{
            maxTicketsPerPerson: 10,
            ...event,
            startsAt: dateFromTimestamp(event.startsAt) ?? new Date(),
            endsAt: dateFromTimestamp(event.endsAt) ?? new Date(),
            photo: getEventStorageRef(event.merchantId, event.id, event.photo)
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
                  input: <ArrayInput maxItemCount={3} input={<Field />}/>
                },
                {
                  name: "photo",
                  input: <ImagePicker isRemovable={false} />
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
                close => <Modal>
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
        <p>Drag and drop to reorder. Click to edit.</p>
        <Spacer y={3} />
        {
          products.map(product => {
            return <div key={product.id}>
              <ProductListing product={product} />
              <Spacer y={2} />
            </div>
          })
        }
      </div>
      
    </div>
  </div>
}



