import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import { HelmetProvider } from "react-helmet-async";
import App from "./app/shared/App";
import BasketContextProvider from "./app/checkout/basket/BasketContext";

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
