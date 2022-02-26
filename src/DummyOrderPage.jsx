import React, { useState, useEffect } from 'react';
import AddItem from './scenes/EditList/AddItem/AddItem';

import useQueryString from './hooks/useQueryString';

function DummyOrderPage() {

    const [orderListId, setOrderListId] = useQueryString('listId');

  if(orderListId) {
    return (
      <div>
        <AddItem orderListId = {orderListId} userId = 'anon-customer'></AddItem>
      </div>
    );
  }
  return (
    <div>
      New here?
    </div>
  );

}


export default DummyOrderPage;