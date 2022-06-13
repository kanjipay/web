import { createContext, useReducer } from "react";
import { LocalStorageKeys } from "../../../utils/IdentityManager";
import AttributionAction from "./AttributionAction";
import AttributionReducer from "./AttributionReducer";

export const AttributionContext = createContext()

export function loadAttributionState() {
  const attributionItemsString = localStorage.getItem(LocalStorageKeys.ATTRIBUTION_ITEMS)
  const attributionItemsWithStringDates = attributionItemsString ? JSON.parse(attributionItemsString) : []

  const attributionItems = attributionItemsWithStringDates.map(item => {
    return {
      ...item,
      addedAt: Date.parse(item.addedAt)
    }
  })

  return {
    attributionItems
  }
}

const initialState = loadAttributionState()

export default function AttributionContextProvider({ children }) {
  const [state, dispatch] = useReducer(AttributionReducer, initialState);

  const addItem = (payload) => {
    console.log("addItem. payload: ", payload)
    dispatch({ type: AttributionAction.ADD_ITEM, payload })
  }

  const clearItems = (payload) => {
    dispatch({ type: AttributionAction.CLEAR, payload })
  }

  const loadItems = () => {
    dispatch({ type: AttributionAction.LOAD })
  }

  const contextValues = {
    addItem,
    clearItems,
    loadItems,
    ...state
  }

  return <AttributionContext.Provider value={contextValues}>
    {children}
  </AttributionContext.Provider>
}