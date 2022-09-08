import { useEffect, useState } from "react"
import { CopyToClipboardButton } from "../components/CopyToClipboardButton"
import { TextArea } from "../components/Input"
import { Field } from "../components/input/IntField"
import SegmentedControl from "../components/SegmentedControl"
import Spacer from "../components/Spacer"

const og = data => `
Hey {{addressee}},

I work with Mercado and am looking to help artists and event runners across the UK get a higher revenue from ticket sales so thought it would be beneficial to reach out.

Mercado is an Artist First ticketing platform ensuring those who put on the events receive the best possible profit for any shows, all the while using social media marketing and analytics to sell out the tickets.

We’re not currently looking for anything in return, just to help artists out as much as we can.

If the above sounds at all interesting, maybe we could organise a short phone call to chat about your music related plans and a little more about Mercado.

Let me know if a day in the next week or two works well for you?

Cheers,
{{sender}}
`

const artist2 = data => `
Hey {{addressee}}

I'm working on a new ticketing platform, Mercado. We've been working with some great bands and organisers (DJ Mona Lxsa, Scustin and House of Hibernia to name a few) and Shane from Ugolino created the project.

The idea is that we're an artist-first platform, giving them a higher share of booking fees. Would love to talk more about it.

Cheers,
{{sender}}
`

const artist3 = data => `
Hi {{addressee}}

I work with Mercado and am looking to help artists earn more profit from ticket sales so thought it would be beneficial to reach out.

Mercado is working with organisers across the UK and Ireland, such as House of Hibernia and Sail Out, helping them to receive the best possible profit for the shows they put on, all the while using social media marketing and analytics to sell out tickets.

If the above sounds at all interesting, maybe we could organise a short phone call to chat?

Let me know if a day in the next week or two works well for you.

Cheers,
Shane
{{sender}}
`

const loomInitial = data => `
Hey {{addressee}}

I'm working on a new ticketing platform, Mercado. We've been working with some great bands and organisers (DJ Mona Lxsa, Scustin and House of Hibernia to name a few) and Shane from Ugolino created the project.

The idea is that we're an artist-first platform, giving them a higher share of booking fees. Would love to talk more about it. If you want something more visual, here's a video showing you through the platform: https://www.loom.com/share/949a76f6fb8a47078159f8f9763a7c4f.

Cheers,
{{sender}}
`

const loomFollowUp = data => `
Hey {{addressee}}, thought it'd be helpful to show how the platform actually looks and works! Here's a short video going through it: https://www.loom.com/share/949a76f6fb8a47078159f8f9763a7c4f - let me know what you think
`

const templates = {
  "OG": og,
  "Artist2": artist2,
  "Artist3": artist3,
  "Loom follow up": loomFollowUp
}

export default function SalesSender() {
  const [addressee, setAddressee] = useState("")
  const [sender, setSender] = useState("")
  const [template, setTemplate] = useState(Object.keys(templates)[0])
  const [message, setMessage] = useState(Object.values(templates)[0]({ addressee, sender }))

  useEffect(() => {
    const data = { addressee, sender }

    const newMessage = templates[template](data)
      .replace(/{{[a-zA-Z]+}}/g, match => {
        const variable = match.replace("{{", "").replace(" ", "").replace("}}", "")
        return data[variable] ?? ""
      })
      .trim()

    setMessage(newMessage)
  }, [template, addressee, sender])

  return <div>
    <div style={{ maxWidth: 1000, padding: "0 16px", margin: "auto" }}>
      <Spacer y={9} />
      <h4 className="header-xs">Sender</h4>
      <Spacer y={1} />
      <Field
        value={sender}
        onChange={e => setSender(e.target.value)}
      />
      <Spacer y={3} />
      <h4 className="header-xs">Addressee</h4>
      <Spacer y={1} />
      <Field
        value={addressee}
        onChange={e => setAddressee(e.target.value)}
      />
      <Spacer y={3} />
      <h4 className="header-xs">Template</h4>
      <Spacer y={1} />
      <SegmentedControl 
        values={Object.keys(templates)}
        value={template}
        onChange={e => setTemplate(e.target.value)}
      />
      <Spacer y={2} />
      <CopyToClipboardButton text={template} />

      <Spacer y={3} />

      <h4 className="header-xs">Message</h4>
      <Spacer y={2} />
      <CopyToClipboardButton text={message} />
      <Spacer y={2} />
      <TextArea
        style={{ height: 500 }}
        value={message}
        onChange={e => setMessage(e.target.value)}
      />
      <Spacer y={9} />
    </div>
  </div>
}