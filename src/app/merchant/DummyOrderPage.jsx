import React from "react";
import AddItem from "./scenes/EditList/AddItem/AddItem";
import useCustomerQueryString from "../../utils/hooks/useQueryString";

function DummyOrderPage() {
  const [orderListId] = useCustomerQueryString("listId");

  if (orderListId) {
    return (
      <div>
        <AddItem orderListId={orderListId} userId="anon-customer"></AddItem>
      </div>
    );
  }
  return <div>New here?</div>;
}

export default DummyOrderPage;
