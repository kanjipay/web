import "./App.css";
import React, { useState } from "react";
import CustomerForm from "./CustomerForm";
import Confirm from "./Confirm";
import Summary from "./Summary";

function App() {
  const [page, setPage] = useState("details");

  if (page === "details") {
    return <CustomerForm page={page} setPage={setPage} />;
  }
  if (page === "confirm") {
    return <Confirm setPage={setPage} />;
  }
  if (page === "summary") {
    return <Summary />;
  }
}

export default App;
