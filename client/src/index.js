import React from "react"
import ReactDOM from "react-dom"
import "./index.css"
import { HelmetProvider } from "react-helmet-async"
import { BrowserRouter } from "react-router-dom"
import App from "./app/App"
import BasketContextProvider from "./app/customer/menu/basket/BasketContext"
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider"
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns"
import AttributionContextProvider from "./app/shared/attribution/AttributionContext"
import { IntlProvider } from "react-intl"
import * as Sentry from "@sentry/react";
import { BrowserTracing } from "@sentry/tracing";
import Environment from "./enums/Environment"
import ScrollToTop from "./app/ScrollToTop"
import { GrowthBookProvider } from "@growthbook/growthbook-react";
import ExperimentManager from "./utils/ExperimentManager"

if (process.env.REACT_APP_ENV_NAME === Environment.PROD) {
  Sentry.init({
    dsn: "https://0df91bf606524301ae038acb4238c3d0@o1326715.ingest.sentry.io/6587262",
    integrations: [new BrowserTracing()],
    environment: process.env.REACT_APP_ENV_NAME,
    tracesSampleRate: process.env.REACT_APP_ENV_NAME === Environment.PROD ? 0.2 : 1.0,
  });
}

console.log("environment: ", process.env.REACT_APP_ENV_NAME)

ReactDOM.render(
  <React.StrictMode>
    <BasketContextProvider>
      <AttributionContextProvider>
        <HelmetProvider>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <IntlProvider locale={navigator.language} defaultLocale="en-GB">
              <GrowthBookProvider growthbook={ExperimentManager.main.growthbook}>
                <BrowserRouter>
                  <ScrollToTop />
                  <App />
                </BrowserRouter>
              </GrowthBookProvider>
            </IntlProvider>
          </LocalizationProvider>
        </HelmetProvider>
      </AttributionContextProvider>
    </BasketContextProvider>
  </React.StrictMode>,
  document.getElementById("root")
)

// serviceWorkerRegistration.unregister();
