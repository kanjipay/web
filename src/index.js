import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import { HelmetProvider } from "react-helmet-async";
import App from "./App";
import BasketContextProvider from "./app/customer/basket/BasketContext";

console.log("environment: ", process.env.REACT_APP_ENV_NAME);
console.log("audit_version", 3);

ReactDOM.render(
  <React.StrictMode>
    <BasketContextProvider>
      <HelmetProvider>
        <App />
      </HelmetProvider>
    </BasketContextProvider>
  </React.StrictMode>,
  document.getElementById("root")
);
