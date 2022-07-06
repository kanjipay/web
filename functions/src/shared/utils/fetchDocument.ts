import Collection from "../enums/Collection"
import { db } from "./admin"
import { HttpError, HttpStatusCode } from "./errors"

export async function fetchDocument(
  collectionName: Collection,
  docId: string,
  checks: any = {}
): Promise<any> {
  const camelCaseName =
    collectionName[0].toLowerCase() + collectionName.slice(1)

  function generateErrorObject(error: HttpError) {
    return { [camelCaseName + "Error"]: error }
  }

  const doc = await db().collection(collectionName).doc(docId).get()

  if (!doc.exists) {
    const errorMessage = `${collectionName} with id ${docId} doesn't exist.`
    const error = new HttpError(
      HttpStatusCode.NOT_FOUND,
      errorMessage,
      errorMessage
    )
    return generateErrorObject(error)
  }

  for (const [fieldName, requiredValue] of Object.entries(checks)) {
    const actualValue = doc.data()[fieldName]

    if (actualValue !== requiredValue) {
      const errorMessage = `${collectionName} has incorrect ${fieldName}.`
      const error = new HttpError(
        HttpStatusCode.BAD_REQUEST,
        errorMessage,
        errorMessage
      )
      return generateErrorObject(error)
    }
  }

  return {
    [camelCaseName]: { id: doc.id, ...doc.data() },
  }
}
