import { createContext, useReducer } from "react"
import BasketReducer from "./BasketReducer"

export const BasketContext = createContext()

const basketArray = localStorage.getItem('basket')

const storage = basketArray ? JSON.parse(basketArray) : []
const initialState = { items: storage }

export default function BasketContextProvider({ children }) {
  const [state, dispatch] = useReducer(BasketReducer, initialState)

  const increase = payload => {
    dispatch({type: 'INCREASE', payload})
  }

  const decrease = payload => {
    dispatch({type: 'DECREASE', payload})
  }

  const addProduct = payload => {
    dispatch({type: 'ADD_ITEM', payload})
  }

  const removeProduct = payload => {
    dispatch({type: 'REMOVE_ITEM', payload})
  }

  const clearCart = () => {
    dispatch({type: 'CLEAR'})
  }

  const handleCheckout = () => {
    console.log('CHECKOUT', state);
    dispatch({type: 'CHECKOUT'})
  }

  const contextValues = {
    increase,
    decrease,
    addProduct,
    removeProduct,
    clearCart,
    handleCheckout,
    ...state
  }

  return (
    <BasketContext.Provider value={contextValues}>
      {children}
    </BasketContext.Provider>
  )
}