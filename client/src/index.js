import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import { HelmetProvider } from "react-helmet-async";
import App from "./App";
import BasketContextProvider from "./app/menu/basket/BasketContext";
// import * as serviceWorkerRegistration from './serviceWorkerRegistration';

console.log("environment: ", process.env.REACT_APP_ENV_NAME);
console.log("isLocal: ", process.env.REACT_APP_IS_LOCAL)
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

// serviceWorkerRegistration.unregister();