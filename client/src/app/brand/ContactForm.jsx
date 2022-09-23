import { useState } from "react";
import { isMobile } from "react-device-detect";
import Form, { generateValidator } from "../../components/Form";
import { TextArea } from "../../components/Input";
import Dropdown from "../../components/input/Dropdown";
import { Field } from "../../components/input/IntField";
import { validateEmail } from "../../utils/helpers/validation";
import { NetworkManager } from "../../utils/NetworkManager";

export default function ContactForm({ style }) {
  const [isSubmitted, setIsSubmitted] = useState(false)
  const handleSubmit = async data => {
    await NetworkManager.post("/airtable", data)

    setIsSubmitted(true)
  }

  return <div 
    style={{
      maxWidth: 600,
      margin: "auto",
      ...style
    }}
  >
    <h2 className="header-m" style={{ marginBottom: 24, fontFamily: "Rubik, sans-serif", fontWeight: 800, textAlign: "center" }}>Interested in working with us?</h2>
    <Form 
      style={{ flexGrow: 100 }}
      clearsOnSubmit
      formGroupData={data => [
        {
          items: [
            {
              name: "name",
              label: "Your name"
            },
            {
              name: "segment",
              label: "Which option best describes you?",
              input: <Dropdown
                optionList={[
                  { value: "ARTIST", label: "I'm an artist or artist manager" },
                  { value: "PROMOTER", label: "I promote events" },
                  { value: "VENUE", label: "I own or work at a venue" },
                  { value: "OTHER", label: "Other" },
                ]}
              />,
            },
            {
              name: "company",
              label: data.segment === "VENUE" ? "Venue name" : "Company",
              visible: !!data.segment && data.segment !== "ARTIST",
              required: !!data.segment && data.segment !== "ARTIST",
            },
            {
              name: "email",
              validators: [generateValidator(validateEmail, "Invalid email")],
              input: <Field type="email" autocomplete="email" />,
            },
            {
              name: "notes",
              label: "Your message",
              input: <TextArea />,
              required: false
            }
          ]
        }
      ]}
      submitTitle={isSubmitted ? "We'll be in touch soon" : "Send us a message"}
      disabled={isSubmitted}
      onSubmit={handleSubmit}
    />
  </div>
}