import BasketAction from "./BasketAction";

function storeItems(basketItems) {
  localStorage.setItem(
    "basket",
    JSON.stringify(basketItems.length > 0 ? basketItems : [])
  );
}

function storeMerchant(merchant) {
  localStorage.setItem(
    "basketMerchant",
    merchant ? JSON.stringify(merchant) : null
  );
}

export const sumItems = (basketItems) => {
  storeItems(basketItems);
  let itemCount = basketItems.reduce(
    (total, product) => total + product.quantity,
    0
  );
  let total = basketItems.reduce(
    (total, product) => total + product.price * product.quantity,
    0
  );
  return { itemCount, total };
};

export default function BasketReducer(state, action) {
  switch (action.type) {
    case BasketAction.ADD_ITEM:
      const basketItem = action.payload;

      if (!state.basketItems.find((item) => item.id === basketItem.id)) {
        state.basketItems.push(basketItem);
      }

      return {
        ...state,
        ...sumItems(state.basketItems),
        basketItems: [...state.basketItems],
      };
    case BasketAction.REMOVE_ITEM:
      return {
        ...state,
        ...sumItems(
          state.basketItems.filter((item) => item.id !== action.payload.id)
        ),
        basketItems: [
          ...state.basketItems.filter((item) => item.id !== action.payload.id),
        ],
      };
    case BasketAction.CHANGE_QUANTITY:
      const { itemId, quantity } = action.payload;

      state.basketItems[
        state.basketItems.findIndex((item) => item.id === itemId)
      ].quantity = quantity;

      return {
        ...state,
        ...sumItems(state.basketItems),
        basketItems: [...state.basketItems],
      };
    case BasketAction.CHANGE_MERCHANT:
      const basketMerchant = action.payload;
      state.basketMerchant = basketMerchant;

      storeMerchant(basketMerchant);

      return {
        basketItems: [],
        ...sumItems([]),
        basketMerchant,
      };
    case BasketAction.CHECKOUT:
      storeMerchant(null);

      return {
        basketItems: [],
        merchant: null,
        checkout: true,
        ...sumItems([]),
      };
    case BasketAction.CLEAR:
      storeMerchant(null);

      return {
        basketItems: [],
        merchant: null,
        ...sumItems([]),
      };
    default:
      return state;
  }
}
