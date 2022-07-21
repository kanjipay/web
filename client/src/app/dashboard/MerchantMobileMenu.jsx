import { useParams } from "react-router-dom"
import MobilePopupMenu from "../../components/MobilePopupMenu"

export default function MerchantMobileMenu() {
  const { merchantId } = useParams()

  const baseUrl = `/dashboard/o/${merchantId}`

  return <MobilePopupMenu navItems={[
    {
      title: "Switch organisation",
      path: `/dashboard`
    },
    {
      title: "Events",
      path: `${baseUrl}/events`
    },
    {
      title: "Settings",
      path: `${baseUrl}/settings`
    },
    {
      title: "Analytics",
      path: `${baseUrl}/analytics`
    },
    
  ]} />
}