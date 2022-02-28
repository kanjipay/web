const Storage = (basketItems) => {
  localStorage.setItem('basket', JSON.stringify(basketItems.length > 0 ? basketItems : []));
}

export const sumItems = basketItems => {
  Storage(basketItems);
  let itemCount = basketItems.reduce((total, product) => total + product.quantity, 0);
  let total = basketItems.reduce((total, product) => total + product.price * product.quantity, 0).toFixed(2);
  return { itemCount, total }
}

export default function BasketReducer(state, action) {
  switch (action.type) {
    case "ADD_ITEM":
      if (!state.basketItems.find(item => item.id === action.payload.id)) {
        state.basketItems.push({
          ...action.payload,
          quantity: 1
        })
      }

      return {
        ...state,
        ...sumItems(state.basketItems),
        basketItems: [...state.basketItems]
      }
    case "REMOVE_ITEM":
      return {
        ...state,
        ...sumItems(state.basketItems.filter(item => item.id !== action.payload.id)),
        basketItems: [...state.basketItems.filter(item => item.id !== action.payload.id)]
      }
    case "INCREASE":
      state.basketItems[state.basketItems.findIndex(item => item.id === action.payload.id)].quantity++
      return {
        ...state,
        ...sumItems(state.basketItems),
        basketItems: [...state.basketItems]
      }
    case "DECREASE":
      state.basketItems[state.basketItems.findIndex(item => item.id === action.payload.id)].quantity--
      return {
        ...state,
        ...sumItems(state.basketItems),
        basketItems: [...state.basketItems]
      }
    case "CHECKOUT":
      return {
        basketItems: [],
        checkout: true,
        ...sumItems([]),
      }
    case "CLEAR":
      return {
        basketItems: [],
        ...sumItems([]),
      }
    default:
      return state
  }
}