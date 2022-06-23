import { Route, Routes, useParams } from "react-router-dom"
import CheckerPage from "./CheckerPage"

export default function Event({ events }) {
  const { eventId } = useParams()
  const event = events.find(e => e.id === eventId)

  return <Routes>
    <Route path="/" element={<CheckerPage event={event} />} />
  </Routes>
}