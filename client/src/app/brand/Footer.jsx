import { format } from "date-fns"
import { isMobile } from "react-device-detect"
import { Link } from "react-router-dom"
import Spacer from "../../components/Spacer"
import { Colors } from "../../enums/Colors"
import { Anchor } from "../auth/AuthPage"

function FooterLinkSection({ title, linkData }) {
  return <div>
    <h3 style={{ fontWeight: 600, color: Colors.WHITE, fontSize: "1.2em" }}>{title}</h3>
    <Spacer y={3} />
    {
      linkData.map(({ title, to, href }) => <div>
        {
          to && <Link
            style={{ color: Colors.OFF_WHITE_LIGHT, fontWeight: "normal" }}
            to={to}
          >
            {title}
          </Link>
        }

        {
          href && <Anchor 
            style={{ fontWeight: "normal" }}
            isDark
            href={href}
          >
            {title}
          </Anchor>
        }
        
        <Spacer y={2} />
      </div>)
    }
  </div>
}

export default function Footer() {
  const columnCount = isMobile ? 2 : 4

  const currDate = new Date()
  const yearString = format(currDate, "yyyy")

  const calendlyLink = "https://calendly.com/matt-at-mercado/demo"

  return <footer style={{ backgroundColor: Colors.BLACK }}>
    <div style={{ maxWidth: 1200, padding: "64px 16px", margin: "auto" }}>
      <Link to="/" style={{ fontFamily: "Rubik, sans-serif", fontSize: 32, color: Colors.WHITE, fontWeight: 600 }}>Mercado</Link>
      <Spacer y={2} />
      <p style={{ color: Colors.OFF_WHITE }}>© {yearString} Kanjipay Ltd. All rights reserved. Company number: 13931899.</p>
      <Spacer y={4} />
      <div style={{ display: "grid", gridTemplateColumns: `repeat(${columnCount}, 1fr)`, columnGap: 16, rowGap: 16 }}>
        <FooterLinkSection
          title="Product"
          linkData={[
            {
              title: "Pricing",
              to: "/pricing"
            },
            {
              title: "FAQs",
              to: "/faqs"
            }
          ]}
        />
        <FooterLinkSection
          title="Legal"
          linkData={[
            {
              title: "Privacy Policy",
              to: "/legal/privacy-policy"
            },
            {
              title: "Organiser terms",
              to: "/legal/organiser-terms-and-conditions"
            }
          ]}
        />
        <FooterLinkSection
          title="Get in contact"
          linkData={[
            {
              title: "Email",
              href: "mailto:team@mercadopay.co?subject=Enquiry about Mercado"
            },
            {
              title: "Book a demo",
              href: calendlyLink
            },
            {
              title: "Instagram",
              href: "https://www.instagram.com/mercado.tickets/"
            }
          ]}
        />
      </div>
      
    </div>
  </footer>
}