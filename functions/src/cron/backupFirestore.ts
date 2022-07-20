import { logger } from "firebase-functions/v1"
import * as firestore from "@google-cloud/firestore"

const client = new firestore.v1.FirestoreAdminClient()

function getBucketUrl(environment) {
  if (['DEV', 'PROD', 'STAGING'].includes(environment)) {
    return `gs://mercado-${environment.toLowerCase()}-backup`
  } else {
    throw new Error(`missing or invalid ENVIRONMENT ${environment}`)
  }
}

export const backupFirestore = () => {
  const projectId = process.env.GCP_PROJECT || process.env.GCLOUD_PROJECT
  const databaseName = client.databasePath(projectId, "(default)")
  const outputUriPrefix = getBucketUrl(process.env.ENVIRONMENT)
  // todo maybe only run for prod as a cost saving
  logger.log(`project Id ${projectId} databaseName ${databaseName} env ${process.env.ENVIRONMENT} outputUriPrefix ${outputUriPrefix}`)
  
  return client
    .exportDocuments({
      name: databaseName,
      outputUriPrefix,
      // Empty array == all collections
      collectionIds: [],
    })
    .then(([response]) => {
      logger.log(`Operation Name: ${response.name}`)
      return response
    })
    .catch((err) => {
      logger.error(err)
      throw new Error("Export operation failed")
    })
}
