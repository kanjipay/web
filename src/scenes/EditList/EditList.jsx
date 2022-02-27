import React from "react";
// import './EditList.css';
import ItemList from "./ItemList/ItemList";

function EditList(props) {
  const { orderListId } = props;

  return (
    <div>
      <header className="app-header">
        <h1>Live Order List</h1>
        <p>
          When someone else adds an item it will instantly appear on the list.
        </p>
      </header>
      <div className="edit-container">
        <div className="list-column">
          <ItemList {...{ orderListId }}></ItemList>
        </div>
      </div>
      <footer className="app-footer">
        <p>
          Share your shop with others using{" "}
          <a
            href={`/checkout/test/385as2als921hsa?listId=${orderListId}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            this link
          </a>{" "}
        </p>
      </footer>
    </div>
  );
}

export default EditList;
