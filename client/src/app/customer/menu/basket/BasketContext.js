import { createContext, useReducer } from "react"
import { LocalStorageKeys } from "../../../../utils/IdentityManager"
import BasketAction from "./BasketAction"
import BasketReducer, { sumItems } from "./BasketReducer"

export const BasketContext = createContext()

export function loadBasketState() {
  const basketArray = localStorage.getItem(LocalStorageKeys.BASKET)
  const basketMerchant = localStorage.getItem(LocalStorageKeys.BASKET_MERCHANT)

  const storedBasketItems = basketArray ? JSON.parse(basketArray) : []
  const storedBasketMerchant = basketMerchant
    ? JSON.parse(basketMerchant)
    : null

  return {
    basketItems: storedBasketItems,
    ...sumItems(storedBasketItems),
    checkout: false,
    basketMerchant: storedBasketMerchant,
  }
}

const initialState = loadBasketState()

export default function BasketContextProvider({ children }) {
  const [state, dispatch] = useReducer(BasketReducer, initialState)

  const changeMerchant = (payload) => {
    dispatch({ type: BasketAction.CHANGE_MERCHANT, payload })
  }

  const changeQuantity = (payload) => {
    dispatch({ type: BasketAction.CHANGE_QUANTITY, payload })
  }

  const addItem = (payload) => {
    dispatch({ type: BasketAction.ADD_ITEM, payload })
  }

  const removeItem = (payload) => {
    dispatch({ type: BasketAction.REMOVE_ITEM, payload })
  }

  const clearBasket = () => {
    dispatch({ type: BasketAction.CLEAR })
  }

  const loadBasket = () => {
    dispatch({ type: BasketAction.LOAD })
  }

  const handleCheckout = () => {
    dispatch({ type: BasketAction.CHECKOUT })
  }

  const contextValues = {
    changeQuantity,
    changeMerchant,
    addItem,
    removeItem,
    clearBasket,
    loadBasket,
    handleCheckout,
    ...state,
  }

  return (
    <BasketContext.Provider value={contextValues}>
      {children}
    </BasketContext.Provider>
  )
}
