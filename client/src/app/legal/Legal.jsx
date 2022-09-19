import { Route, Routes } from "react-router-dom";
import OrganiserTerms from "./OrganiserTerms";
import PrivacyPolicy from "./PrivacyPolicy";

export default function Legal() {
  return <Routes>
    <Route path="organiser-terms-and-conditions" element={<OrganiserTerms />} />
    <Route path="privacy-policy" element={<PrivacyPolicy />} />
  </Routes>
}