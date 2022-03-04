// import 'dotenv/config'
import React from "react";
import ReactDOM from "react-dom";
// import "bootstrap/dist/css/bootstrap.css";
import "./index.css";
import App from "./app/shared/App";
import BasketContextProvider from "./app/checkout/basket/BasketContext";

console.log(process.env.REACT_APP_STAGE)

ReactDOM.render(
  <React.StrictMode>
    <BasketContextProvider>
      <App />
    </BasketContextProvider>
  </React.StrictMode>,
  document.getElementById("root")
);
