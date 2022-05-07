import { getDoc, updateDoc } from "firebase/firestore";
import Collection from "../../enums/Collection";
import { ApiName, NetworkManager } from "../NetworkManager";
import { restoreState, saveState } from "./StateService";

export async function createLink(path) {
  const stateId = await saveState()

  const res = await NetworkManager.post(ApiName.INTERNAL, "/links", {
    path, stateId
  })

  return res.data.linkId;
}

export async function fetchLink(linkId) {
  const doc = await getDoc(Collection.LINK.docRef(linkId));

  if (!doc.exists()) {
    throw new Error(`No link with id ${linkId}`);
  }

  return { id: doc.id, ...doc.data() }
}

export async function acceptLink(link) {
  const { stateId } = link

  if (stateId) {
    await restoreState(stateId)
  }
  
  await updateDoc(Collection.LINK.docRef(link.id), { wasUsed: true });
  
  return
}