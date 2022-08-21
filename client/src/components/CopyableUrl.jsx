import { CopyToClipboardButton } from "./CopyToClipboardButton";

export function CopyableUrl({ urlString }) {
  return (
    <div style={{ display: "flex", alignItems: "center", columnGap: 16 }}>
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
  )
}