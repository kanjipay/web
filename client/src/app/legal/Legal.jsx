import { Route, Routes } from "react-router-dom";
import { Colors } from "../../enums/Colors";
import OrganiserTerms from "./OrganiserTerms";

export default function Legal() {
  return <div style={{ backgroundColor: Colors.OFF_WHITE_LIGHT }}>
    <Routes>
      <Route path="organiser-terms-and-conditions" element={<OrganiserTerms />} />
    </Routes>
  </div>
}