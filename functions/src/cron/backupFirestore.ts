import { logger } from "firebase-functions/v1"
import * as firestore from "@google-cloud/firestore"

const client = new firestore.v1.FirestoreAdminClient()

function getBucketUrl(environment){
    if(environment in ['DEV', 'PROD', 'STAGING']){
        return `gs://mercado-${environment.toLowerCase()}-backup`
    }else{
        new Error(`missing or invalid ENVIRONMENT ${environment}`)
    }
}

export const backupFirestore = () => {
  const projectId = process.env.GCP_PROJECT || process.env.GCLOUD_PROJECT
  const databaseName = client.databasePath(projectId, "(default)")
  // todo maybe only run for prod as a cost saving
  return client
    .exportDocuments({
      name: databaseName,
      // todo paramterise
      outputUriPrefix: getBucketUrl(process.env.ENVIRONMENT),
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
