import { getDoc, getDocs, query, updateDoc, where } from "firebase/firestore"
import React, { useEffect, useRef, useState } from "react"
import Popup from "reactjs-popup"
import Spinner from "../../../../assets/Spinner"
import { ButtonTheme } from "../../../../components/ButtonTheme"
import { CopyableUrl } from "../../../../components/CopyableUrl"
import { Field } from "../../../../components/input/IntField"
import MainButton from "../../../../components/MainButton"
import { Modal } from "../../../../components/Modal"
import QRCodeSection from "../../../../components/QRCodeSection"
import Spacer from "../../../../components/Spacer"
import Collection from "../../../../enums/Collection"
import { Colors } from "../../../../enums/Colors"
import { AttributionLinkSection } from "./AttributionLinkSection"

function AsyncCheckField({ input, check, value, ...props }) {
  const [checkResult, setCheckResult] = useState(null)

  const Input = React.cloneElement(input, { value, ...props })

  useEffect(() => {
    setCheckResult(null)

    const timeout = setTimeout(() => {
      check(value).then(setCheckResult)
    }, 1000)

    return () => clearTimeout(timeout)
  }, [value, check])

  return <div>
    <div style={{ position: "relative", width: "100%", backgroundColor: Colors.RED }}>
      {Input}
      {!checkResult && <Spinner
        length={16}
        style={{ 
          position: "absolute", 
          top: "50%", 
          right: 16, 
          transform: "translate(-50%, -50%)" 
        }}
      />}
    </div>
    
    {
      checkResult && !checkResult.isValid && checkResult.message && <div>
        <Spacer y={2} />
        <p 
          className="text-body-faded" 
          style={{ color: Colors.RED }}
        >
          {checkResult.message}
        </p>
      </div>
    }
  </div>
}


export default function EventLinkTab({ merchant, event, attributionLinks }) {
  const [eventLinkName, setEventLinkName] = useState(event.linkName)
  const [merchantLinkName, setMerchantLinkName] = useState(merchant.linkName)
  const [isLoading, setIsLoading] = useState(false)

  const baseUrl = new URL(window.location.href)
  baseUrl.pathname = ""
  const baseUrlString = baseUrl.href

  let eventLinkString

  if (merchant.linkName && event.linkName) {
    eventLinkString = `${baseUrlString}e/${merchant.linkName}/${event.linkName}`
  } else {
    eventLinkString = `${baseUrlString}events/${merchant.id}/${event.id}`
  }

  const handleSaveCustomLink = async () => {
    setIsLoading(true)

    console.log(merchantLinkName)
    console.log(eventLinkName)

    const checks = await Promise.all([
      isMerchantLinkNameAvailable(merchantLinkName),
      isEventLinkNameAvailable(eventLinkName)
    ])

    console.log(checks)

    if (!checks.every(c => c.isValid)) {
      setIsLoading(false)

      return {
        isValid: false,
        message: "This link isn't available"
      }
    }

    const updateEvent = updateDoc(
      Collection.EVENT.docRef(event.id),
      { linkName: eventLinkName }
    )

    const promises = [updateEvent]

    if (merchantLinkName && merchantLinkName !== merchant.linkName) {
      const updateMerchant = updateDoc(
        Collection.MERCHANT.docRef(merchant.id),
        { linkName: merchantLinkName }
      )

      promises.push(updateMerchant)
    }

    await Promise.all(promises)

    setIsLoading(false)

    return {
      isValid: true,
      message: "Link changed successfully"
    }
  }

  const isEventLinkNameAvailable = async linkName => {
    if (!linkName || linkName === "") {
      return { isValid: false }
    }

    const eventSnapshot = await getDocs(query(
      Collection.EVENT.ref,
      where("linkName", "==", linkName),
      where("merchantId", "==", merchant.id)
    ))

    const eventDocs = eventSnapshot.docs

    const isValid = (
      eventDocs.length === 0 ||
      (
        eventDocs.length === 1 &&
        eventDocs[0].id === event.id
      )
    )

    return {
      isValid,
      message: "One of your events already has that name."
    }
  }

  const isMerchantLinkNameAvailable = async linkName => {
    if (!linkName || linkName === "") {
      return { isValid: false }
    }

    const merchantSnapshot = await getDocs(query(
      Collection.MERCHANT.ref,
      where("linkName", "==", linkName)
    ))

    const merchantDocs = merchantSnapshot.docs

    console.log(merchantDocs)

    const isValid = (
      merchantDocs.length === 0 || 
      (
        merchantDocs.length === 1 &&
        merchantDocs[0].id === merchant.id
      )
    )

    return {
      isValid,
      message: "Another event organiser has already taken that name."
    }
  }

  const linkNameRegex = /[a-z0-9]{1}[a-z0-9\-]*[a-z0-9]{1}|[a-z0-9]*/

  if (event.isPublished) {
    return <div style={{ maxWidth: 500 }}>
      <div>
        <h3 className="header-s">Text link</h3>
        <Spacer y={2} />
        <CopyableUrl urlString={eventLinkString} />
        <Spacer y={2} />
        {
          merchant.linkName ?
            <div>
              {
                !event.linkName && <div>
                  <p className="text-body-faded">Want a more personalised link? You can create one that contains your name, and the name of your event.</p>
                  <Spacer y={2} />
                </div>
              }
              <h4 className="header-xs">Event link name</h4>
              <Spacer y={1} />
              <AsyncCheckField
                input={
                  <Field
                    onChange={e => setEventLinkName(e.target.value)}
                    regex={linkNameRegex}
                    maxChars={20}
                  />
                }
                check={isEventLinkNameAvailable}
                value={eventLinkName}
              />
              <Spacer y={2} />
              <MainButton
                title="Save changes"
                disabled={!eventLinkName || eventLinkName.length < 2}
                isLoading={isLoading}
                onClick={handleSaveCustomLink}
              />
            </div> :
            <div>
              <p className="text-body-faded">Want a more personalised link? You can create one that contains your name, and the name of your event.</p>
              <Spacer y={2} />
              <Popup
                trigger={<MainButton title="Customise your link" />}
                modal
              >
                {close => <Modal modalStyle={{ textAlign: "left" }}>
                  <h2 className="header-m" style={{ textAlign: "center" }}>Create custom link</h2>
                  <Spacer y={2} />
                  <p>{`${baseUrlString}e/${merchantLinkName}/${eventLinkName}`}</p>
                  <Spacer y={2} />
                  <p className="text-body-faded">Your link must be 2-20 characters, and only include lowercase letters, numbers and dashes.</p>

                  <Spacer y={3} />

                  <h4 className="header-xs">Merchant link name</h4>
                  <Spacer y={1} />
                  <AsyncCheckField
                    input={
                      <Field
                        onChange={e => setMerchantLinkName(e.target.value)}
                        regex={linkNameRegex}
                        maxChars={20}
                      />
                    }
                    check={isMerchantLinkNameAvailable}
                    value={merchantLinkName}
                  />

                  <Spacer y={3} />

                  <h4 className="header-xs">Event link name</h4>
                  <Spacer y={1} />
                  <AsyncCheckField
                    input={
                      <Field
                        onChange={e => setEventLinkName(e.target.value)}
                        regex={linkNameRegex}
                        maxChars={20}
                      />
                    }
                    check={isEventLinkNameAvailable}
                    value={eventLinkName}
                  />

                  <Spacer y={3} />

                  <MainButton
                    title="Save"
                    disabled={!eventLinkName || !merchantLinkName}
                    onClick={async () => {
                      await handleSaveCustomLink()
                      close()
                    }}
                  />

                  <Spacer y={2} />

                  <MainButton
                    title="Cancel"
                    onClick={close}
                    buttonTheme={ButtonTheme.MONOCHROME_OUTLINED}
                  />
                </Modal>}
              </Popup>
            </div>
        }
      </div>
      <Spacer y={6} />
      <QRCodeSection 
        title="QR code link"
        body="Selling tickets on the door, or creating a promotional poster? Download a QR code that links straight to this event." 
        value={eventLinkString}
      />
      <Spacer y={6} />
      <AttributionLinkSection attributionLinks={attributionLinks} />
    </div>
  } else {
    return <div style={{ maxWidth: 500 }}>
      <p className="text-body-faded">
        Visit this link to see a preview of the event.
      </p>
      <Spacer y={2} />
      <CopyableUrl urlString={eventLinkString} />
    </div>
  }
}

