
import { db } from "./admin";
import { firestore } from "firebase-admin"

function sliceIntoChunks(arr, chunkSize) {
    const res = [];
    for (let i = 0; i < arr.length; i += chunkSize) {
        const chunk = arr.slice(i, i + chunkSize);
        res.push(chunk);
    }
    return res;
}

export async function documentBatchFind(documentIds: Array<object>, collectionName: string): Promise<Array<object>>{
    const chunckedIds = sliceIntoChunks(documentIds, 10);
    const documentSnapshotChunks = chunckedIds.map((menuItemsSnapshot) => db().collection(collectionName) 
    .where(firestore.FieldPath.documentId(), "in", menuItemsSnapshot).get())
    const documentSnapshotData = await Promise.all(documentSnapshotChunks);
    return documentSnapshotData.flat();
}