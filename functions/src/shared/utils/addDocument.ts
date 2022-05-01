import Collection from "../enums/Collection"
import { db } from "./admin"

export async function addDocument(collectionName: Collection, data: any) {
  const camelCaseName = collectionName[0].toLowerCase() + collectionName.slice(1)

  const doc = await db()
    .collection(collectionName)
    .add(data)

  return { [camelCaseName + "Id"]: doc.id }
}