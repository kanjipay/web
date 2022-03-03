import { createContext, useReducer } from "react"
import BasketAction from "./BasketAction"
import BasketReducer, { sumItems } from "./BasketReducer"

export const BasketContext = createContext()

const basketArray = localStorage.getItem('basket')
const basketMerchant = localStorage.getItem('basketMerchant')

console.log("stored merchant string", basketMerchant)

const storedBasketItems = basketArray ? JSON.parse(basketArray) : []
const storedBasketMerchant = basketMerchant ? JSON.parse(basketMerchant) : null

console.log("stored merchant", storedBasketMerchant)

const initialState = {
  basketItems: storedBasketItems,
  ...sumItems(storedBasketItems),
  checkout: false,
  basketMerchant: storedBasketMerchant
}

export default function BasketContextProvider({ children }) {
  const [state, dispatch] = useReducer(BasketReducer, initialState)

  const changeMerchant = payload => {
    dispatch({type: BasketAction.CHANGE_MERCHANT, payload})
  }

  const changeQuantity = payload => {
    dispatch({type: BasketAction.CHANGE_QUANTITY, payload})
  }

  const addItem = payload => {
    dispatch({type: BasketAction.ADD_ITEM, payload})
  }

  const removeItem = payload => {
    dispatch({type: BasketAction.REMOVE_ITEM, payload})
  }

  const clearBasket = () => {
    dispatch({type: BasketAction.CLEAR})
  }

  const handleCheckout = () => {
    dispatch({type: BasketAction.CHECKOUT})
  }

  const contextValues = {
    changeQuantity,
    changeMerchant,
    addItem,
    removeItem,
    clearBasket,
    handleCheckout,
    ...state
  }

  return (
    <BasketContext.Provider value={contextValues}>
      {children}
    </BasketContext.Provider>
  )
}