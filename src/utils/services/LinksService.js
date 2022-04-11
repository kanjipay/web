import axios from "axios";
import { getDoc, updateDoc } from "firebase/firestore";
import Collection from "../../enums/Collection";

export async function createLink(path) {
  const res = await axios.post(
    `${process.env.REACT_APP_SERVER_URL}/links`,
    { path }
  );

  return res.data.linkId;
}

export async function fetchLink(linkId) {
  const doc = await getDoc(Collection.LINK.docRef(linkId));

  if (!doc.exists()) {
    throw new Error(`No link with id ${linkId}`);
  }

  return { id: doc.id, ...doc.data() };
}

export function updateLinkAsUsed(linkId) {
  return updateDoc(Collection.LINK.docRef(linkId), { wasUsed: true });
}