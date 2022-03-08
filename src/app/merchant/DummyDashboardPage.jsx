// import React, { useState, useEffect } from "react";
// import * as FirestoreService from "../../utils/services/firestore";
// import * as FirestoreAuth from "../../utils/services/FirestoreAuth";

// import CreateList from "./scenes/CreateList/CreateList";
// import JoinList from "./scenes/JoinList/JoinList";
// import EditList from "./scenes/EditList/EditList";
// import ErrorMessage from "../../components/ErrorMessage/ErrorMessage";

// import useQueryString from "../../utils/hooks/useQueryString";

function MerchantDashboard() {
  // const [merchant, setMerchant] = useState("");
  // const [orderList, setOrderList] = useState("");
  // const [userId, setUserId] = useState("");
  // const [error, setError] = useState("");
  // // const [authToken, setAuthToken] = useState();

  // const [orderListId, setOrderListId] = useQueryString("listId");

  // useEffect(() => {
  //   FirestoreAuth.authenticateAnonymously()
  //     .then((userCredential) => {
  //       setUserId(userCredential.user.uid);
  //       //TODO make authentication user ID link to merchant ID / orderListID
  //       //TODO makesure that the OrderList can be populated if the merchant is offline (this might work by default)

  //       if (orderListId) {
  //         FirestoreService.getOrderList(orderListId)
  //           .then((orderList) => {
  //             if (orderList.exists) {
  //               setError(null);
  //               setOrderList(orderList.data());
  //             } else {
  //               setError("order-list-missing");
  //               setOrderListId();
  //             }
  //           })
  //           .catch(() => setError("order-list-get-fail"));
  //       }
  //     })
  //     .catch(() => setError("auth-failed"));
  // }, [orderListId, setOrderListId]);

  // function onOrderListCreate(orderListId, userName) {
  //   setOrderListId(orderListId);
  //   setMerchant(userName);
  // }

  // function onCloseOrderList() {
  //   setOrderListId();
  //   setOrderList();
  //   setMerchant();
  // }

  // // function onAuthentication() {
  // //   setAuthToken(localStorage.getItem('Auth Token'))
  // // }

  // function onSelectUser(userName) {
  //   setMerchant(userName);
  //   FirestoreService.getOrderList(orderListId)
  //     .then((updatedOrderList) => setOrderList(updatedOrderList.data()))
  //     .catch(() => setError("order-list-get-fail"));
  // }

  // // render a scene based on the current state
  // if (orderList && merchant) {
  //   return <EditList {...{ orderListId }}></EditList>;
  // } else if (orderList) {
  //   return (
  //     <div>
  //       <ErrorMessage errorCode={error}></ErrorMessage>
  //       <JoinList
  //         users={orderList.users}
  //         {...{ onSelectUser, onCloseOrderList }}
  //       ></JoinList>
  //     </div>
  //   );
  // }
  return (
    <div>
      {/* <ErrorMessage errorCode={error}></ErrorMessage> */}

      {/* <CreateList onCreate={onOrderListCreate} userId={userId}></CreateList> */}
    </div>
  );
}

export default MerchantDashboard;
