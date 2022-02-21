import React, { useState } from "react";
import db from "./FirebaseUtils";
import BankPicker from "./BankPicker";
import { collection, addDoc } from "firebase/firestore";

export function CustomerForm({ page, setPage }) {
  const [firstName, setFirstName] = useState("");
  const [secondName, setSecondName] = useState("");
  const [selectedBank, setBank] = useState("");

  const handleSubmit = (evt) => {
    evt.preventDefault();
    // TODO validate user credentials
    if (selectedBank === "") {
      console.log("no bank");
      return;
    }
    /*
    addDoc(collection(db, "customer"), {
      firstname: firstName,
      secondname: secondName,
      bank: selectedBank,
    });
    */
    // Todo make payment
    setPage("confirm");
  };

  return (
    <div className="App p-5 bg-light">
      <h2 className="mb-3">Your Payment Summary</h2>
      <h5 className="mb-3">Payment</h5>
      <span className="paymentAmount">£30.00</span>
      <br />
      <span className="paymentRecipietn">Sapling Spirits</span>
      <br />
      <div className="py-6">
        <form onSubmit={handleSubmit}>
          <h5 className="mb-3">Name</h5>

          <div className="form-outline mb-4">
            <input
              type="text"
              placeholder="First name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="form-control"
              required
              id="formFirstName"
            />
          </div>
          <div className="form-outline mb-4">
            <input
              type="text"
              placeholder="Second name"
              value={secondName}
              onChange={(e) => setSecondName(e.target.value)}
              className="form-control"
              required
            />
          </div>
          <BankPicker selectedBank={selectedBank} setBank={setBank} />

          <div className="mb-3 pt-0">
            <button className="btn btn-primary btn-block mb-4" type="submit">
              Pay with Bank transfer
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CustomerForm;
