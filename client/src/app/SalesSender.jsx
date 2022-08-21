import { useEffect, useState } from "react"
import { CopyToClipboardButton } from "../components/CopyToClipboardButton"
import { TextArea } from "../components/Input"
import { Field } from "../components/input/IntField"
import SegmentedControl from "../components/SegmentedControl"
import Spacer from "../components/Spacer"

const artist = data => `
Hi {{addressee}}

We’ve built a new ticketing platform, Mercado. The project was created by Shane from Jazz/Rap group Ugolino, and we're working with some great promoters and groups such as Scustin, House of Hibernia, Mona Lxsa and Sail Out.

We're organiser-first, giving you 7% higher revenue by sharing booking fees, and listening to feedback, building features that organisers want. I’d love to talk more about it.

Cheers,
{{sender}}
`

const organiser = data => `
Hey {{addressee}}
 
I’m working on a new ticketing platform, Mercado. The project was first built for our friend Shane from Irish Jazz/Rap group Ugolino, who was disappointed with the high booking fees on other platforms.
 
Now we’re also working with some great Irish promoters and groups such as Scustin, House of Hibernia and Mona Lxsa, as well as a few in London.
 
We're organiser-first, giving you 7% higher revenue by sharing booking fees, and listening to feedback, building features that organisers want.
 
I’d love to talk more about it, are you free on Monday/Tuesday next week for a short call?
`

const eventRunnerLong = data => `
Hi {{addressee}},

Are you putting on an event soon?

I work with Mercado, helping event runners across the UK get more revenue from ticket sales so thought it would be beneficial to reach out.

Mercado is a promoter-first ticketing platform. We ensure event runners receive the best possible profit for any shows, all the while using social media marketing and analytics to sell out the tickets. We’re 70% cheaper than RA and Eventbrite.

If the above sounds at all interesting, maybe we could organise a short phone call to chat about your music related plans and a little more about Mercado.

Let me know if a day in the next week or two works well for you?

Cheers,
{{sender}}
`

const templates = {
  "Artist": artist,
  "Organiser": organiser,
  "EventRunnerLong": eventRunnerLong,
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