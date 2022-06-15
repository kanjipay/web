import { NetworkManager } from "../NetworkManager";
import { restoreState, saveState } from "./StateService";

export async function createLink(path) {
  const stateId = await saveState()

  const res = await NetworkManager.post("/links", {
    path, stateId
  })

  return res.data.linkId;
}

export async function fetchLink(linkId) {
  const res = await NetworkManager.get(`/links/l/${linkId}`)
  const link = res.data

  return link
}

export async function acceptLink(link) {
  const { stateId } = link

  if (stateId) {
    await restoreState(stateId)
  }
  
  await NetworkManager.put(`/links/l/${link.id}/accept`)
  
  return
}