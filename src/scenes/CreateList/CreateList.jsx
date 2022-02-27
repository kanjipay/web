import React, { useState } from "react";
// import './CreateList.css';
import * as FirestoreService from "../../services/firestore";
import ErrorMessage from "../../components/ErrorMessage/ErrorMessage";

function CreateList(props) {
  const { onCreate, userId } = props;

  const [error, setError] = useState();

  function createOrderList(e) {
    e.preventDefault();
    setError(null);

    const userName = document.createListForm.userName.value;
    if (!userName) {
      setError("user-name-required");
      return;
    }

    FirestoreService.createOrderList(userName, userId)
      .then((docRef) => {
        onCreate(docRef.id, userName);
      })
      .catch((reason) => setError("create-list-error"));
  }

  return (
    <div>
      <header>
        <h1>Welcome to the Merchant dashboard!</h1>
      </header>
      <div className="create-container">
        <div>
          <form name="createListForm">
            <p>
              <label>What is your shop name?</label>
            </p>
            <p>
              <input type="text" name="userName" />
            </p>
            <ErrorMessage errorCode={error}></ErrorMessage>
            <p>
              <button onClick={createOrderList}>Create a new order list</button>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}

export default CreateList;
