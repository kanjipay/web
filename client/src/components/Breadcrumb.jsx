import { Link } from "react-router-dom"

export default function Breadcrumb({ pageData }) {
  const flexItems = []

  pageData.forEach((pageDatum, index) => {
    const isLastDatum = index === pageData.length - 1
    const { title, path } = pageDatum
    const separator = <p key={`separator-${index}`} className="text-body">/</p>
    flexItems.push(separator)

    const item = isLastDatum ?
      <p key={`title-${index}`} className="text-body" style={{ fontWeight: 600 }}>{title}</p> :
      <Link key={`title-${index}`} style={{ textDecoration: "underline", fontWeight: 400 }} to={path}>
        {title}
      </Link>

    flexItems.push(item)
  })
  return <div style={{ display: "flex", columnGap: 8 }}>
    {flexItems}
  </div>
}