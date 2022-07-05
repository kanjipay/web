import React from "react"
import ReactDOM from "react-dom"
import "./index.css"
import { HelmetProvider } from "react-helmet-async"
import App from "./app/App"
import BasketContextProvider from "./app/customer/menu/basket/BasketContext"
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider"
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns"
import AttributionContextProvider from "./app/shared/attribution/AttributionContext"
// import * as serviceWorkerRegistration from './serviceWorkerRegistration';

console.log("environment: ", process.env.REACT_APP_ENV_NAME)

ReactDOM.render(
  <React.StrictMode>
    <BasketContextProvider>
      <AttributionContextProvider>
        <HelmetProvider>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <App />
          </LocalizationProvider>
        </HelmetProvider>
      </AttributionContextProvider>
    </BasketContextProvider>
  </React.StrictMode>,
  document.getElementById("root")
)

// serviceWorkerRegistration.unregister();
