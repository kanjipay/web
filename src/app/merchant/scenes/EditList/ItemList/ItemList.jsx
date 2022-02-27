import React, { useEffect, useState } from "react";
import * as FirestoreService from "../../../../../utils/services/FirestoreOrders";
import ErrorMessage from "../../../../../components/ErrorMessage/ErrorMessage";

function ItemList(props) {
  const { orderListId } = props;

  const [orderItems, setOrderItems] = useState([]);
  const [error, setError] = useState();

  // Use an effect hook to subscribe to the order list item stream and
  // automatically unsubscribe when the component unmounts.
  useEffect(() => {
    const unsubscribe = FirestoreService.streamOrderListItems(
      orderListId,
      (querySnapshot) => {
        const updatedOrderItems = querySnapshot.docs.map((docSnapshot) =>
          docSnapshot.data()
        );
        setOrderItems(updatedOrderItems);
      },
      (error) => setError("order-list-item-get-fail")
    );
    return unsubscribe;
  }, [orderListId, setOrderItems]);

  const orderItemElements = orderItems.map((orderItem, i) => (
    <div key={i}>{orderItem.name}</div>
  ));

  return (
    <div>
      <ErrorMessage errorCode={error}></ErrorMessage>
      <div>{orderItemElements}</div>
    </div>
  );
}

export default ItemList;
