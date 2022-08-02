import { Route, Routes } from "react-router-dom";
import { Colors } from "../../enums/Colors";
import OrganiserTerms from "./OrganiserTerms";
import PrivacyPolicy from "./PrivacyPolicy";

export default function Legal() {
  return <div style={{ backgroundColor: Colors.OFF_WHITE_LIGHT }}>
    <Routes>
      <Route path="organiser-terms-and-conditions" element={<OrganiserTerms />} />
      <Route path="privacy-policy" element={<PrivacyPolicy />} />
    </Routes>
  </div>
}