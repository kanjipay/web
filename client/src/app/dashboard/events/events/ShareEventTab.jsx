
<div style={{ maxWidth: 500 }}>
      <p className="text-body-faded">
        Visit this link to see a preview of the event.
      </p>
      <Spacer y={2} />
      <CopyableUrl urlString={eventLinkString} />
</div>


export default function ShareEventTab({ merchant, event }){
    return <div className="container">
            <div className="content">
                <h1 className="header-l">Share the event</h1>
                <div style={{ display: "flex", alignItems: "center", columnGap: 16 }}>
      <a
        href={`mailto:?subject=New event&body=Check out this video https://youtu.be/yul2-4mc6mg`} 
        title="Share via Email"
        target="_blank"
        rel="noreferrer"
        style={{ textDecoration: "underline", fontWeight: "400" }}
      >
        Share via email
      </a>
    </div>
                
            </div>
            </div>
}