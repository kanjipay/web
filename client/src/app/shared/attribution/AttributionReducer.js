import AttributionAction from "./AttributionAction"
import { loadAttributionState } from "./AttributionContext"
import { addDays } from "date-fns"

function storeItems(items) {
  localStorage.setItem("attributionItems", JSON.stringify(items ?? []) ?? [])
}

function filterObjectArray(objArray, filterObj, isPositive = true) {
  const keys = Object.keys(filterObj)
  return objArray.filter((obj) =>
    keys.every((key) =>
      isPositive ? filterObj[key] === obj[key] : filterObj[key] !== obj[key]
    )
  )
}

export function getLatestItem(filters) {
  const items = loadAttributionState().attributionItems
  const twoDaysAgo = addDays(new Date(), -2)
  const eligibleItems = filterObjectArray(
    items.filter((item) => item.addedAt > twoDaysAgo),
    filters
  )
  eligibleItems.sort((item1, item2) => item2.addedAt - item1.addedAt) // Sort latest first
  return eligibleItems.find((item) => item)
}

export default function AttributionReducer(state, action) {
  switch (action.type) {
    case AttributionAction.ADD_ITEM:
      const item = {
        ...action.payload,
        addedAt: new Date(),
      }

      state.attributionItems.push(item)

      storeItems(state.attributionItems)

      return state
    case AttributionAction.LOAD:
      return loadAttributionState()
    case AttributionAction.CLEAR:
      const filters = action.payload

      const newItems = filterObjectArray(state.attributionItems, filters, false)

      storeItems(newItems)

      return {
        attributionItems: newItems,
      }
    default:
      return state
  }
}
