import React, { useState } from "react";
// import './JoinList.css';
function JoinList(props) {
  const { users, onSelectUser, onCloseOrderList } = props;


  function addExistingUser(e) {
    e.preventDefault();
    onSelectUser(e.target.innerText);
  }

  function getUserButtonList() {
    const buttonList = users.map((user) => (
      <button key={user.name} onClick={addExistingUser}>
        {user.name}
      </button>
    ));
    return <div className="button-group">{buttonList}</div>;
  }

  function onCreateListClick(e) {
    e.preventDefault();
    onCloseOrderList();
  }

  return (
    <div>
      <header>
        <h1>Welcome to the Order List app!</h1>
      </header>
      <div className="join-container">
        <div>
          <form name="addUserToListForm">
            <p>Select your name if you previously joined the list...</p>
            {getUserButtonList()}
            <p>
              ...or{" "}
              <a href="/" onClick={onCreateListClick}>
                create a new order list
              </a>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}

export default JoinList;
