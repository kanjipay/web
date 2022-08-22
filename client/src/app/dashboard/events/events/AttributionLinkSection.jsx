import { isMobile } from "react-device-detect"
import { useNavigate } from "react-router-dom"
import { CopyToClipboardButton } from "../../../../components/CopyToClipboardButton"
import MainButton from "../../../../components/MainButton"
import Spacer from "../../../../components/Spacer"
import { Colors } from "../../../../enums/Colors"

export function AttributionLinkSection({ attributionLinks }) {
  const navigate = useNavigate()

  return (
    <div>
      <h3 className="header-s">Attribution links</h3>
      <Spacer y={2} />
      <p className="text-body-faded">
        Want to see which of your marketing efforts is bringing in sales? You
        can use attribution links to analyse where your sales are coming from.
      </p>
      {attributionLinks && (
        <div>
          <Spacer y={2} />
          {attributionLinks.length > 0 ? (
            attributionLinks.map((link) => {
              const linkUrl = new URL(window.location.href)
              linkUrl.pathname = `/l/${link.id}`

              const linkUrlString = linkUrl.href

              return (
                <div
                  style={{
                    padding: 16,
                    backgroundColor: Colors.OFF_WHITE_LIGHT,
                    display: isMobile ? "block" : "flex",
                    alignItems: "center",
                    columnGap: 16,
                    marginBottom: 16,
                  }}
                >
                  <div>
                    <h4 className="header-xs">{link.displayName}</h4>
                    <Spacer y={2} />
                    <div style={{ display: "flex", columnGap: 8 }}>
                      {Object.entries(link.attributionData).map(
                        ([key, value]) => (
                          <p
                            style={{
                              backgroundColor: Colors.OFF_WHITE,
                              fontSize: 14,
                              padding: "4px 8px",
                            }}
                          >
                            {`${key} = ${value}`}
                          </p>
                        )
                      )}
                    </div>
                    <Spacer y={2} />
                    <p>{linkUrlString}</p>
                  </div>
                  {
                    isMobile ?
                      <Spacer y={2} /> :
                      <div style={{ flexGrow: 100 }}></div>
                  }

                  <CopyToClipboardButton text={linkUrlString} />
                </div>
              )
            })
          ) : (
            <p className="text-body">
              You don't have any attribution links yet
            </p>
          )}
        </div>
      )}
      <Spacer y={2} />
      <MainButton
        title="Create attribution link"
        onClick={() => navigate("create-attribution-link")}
      />
    </div>
  )
}