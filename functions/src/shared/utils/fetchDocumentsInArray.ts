import { logger } from "firebase-functions/v1"

export async function fetchDocumentsInArray(
  query: FirebaseFirestore.Query<FirebaseFirestore.DocumentData>,
  fieldPath: string | FirebaseFirestore.FieldPath,
  valuesArray: any[],
  isPositive: boolean = true
) {
  logger.log("fetchDocsInArray")
  const promises: Promise<
    FirebaseFirestore.QuerySnapshot<FirebaseFirestore.DocumentData>
  >[] = []

  let i = 0
  const chunkSize = 10

  logger.log("valuesArray: ", { valuesArray })

  while (i < valuesArray.length) {
    const valuesArraySlice = valuesArray.slice(i, i + chunkSize)

    logger.log("slice: ", { valuesArraySlice })

    const retrieveDocs = query
      .where(fieldPath, isPositive ? "in" : "not-in", valuesArraySlice)
      .get()

    promises.push(retrieveDocs)

    i += valuesArraySlice.length
  }

  const querySnapshots = await Promise.all(promises)
  return querySnapshots
    .map((snapshot) => snapshot.docs)
    .flat()
    .map((doc) => {
      const result: any = { id: doc.id, ...doc.data() }

      return result
    })
}
