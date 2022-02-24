import { useEffect } from "react"

export default function Home() {
  useEffect(() => {
    document.title = "Home"
  })

  return (
    <div>
      <header>
        <h1>Mercado</h1>
      </header>
    </div>
  )
}
