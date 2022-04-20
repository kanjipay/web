import Collection from "../../shared/enums/Collection"
import { generateHash } from "../../shared/utils/createHash"
import { fetchDocument } from "../../shared/utils/fetchDocument"


export const checkClientCredentials = async (req, res, next) => {
  // This middleware should check for client id and client secret in the header and verify it
  const clientId = req.headers["mcp-client-id"]

  if (!clientId) {
    console.log("No client id sent in headers")
    return res.sendStatus(403)
  }

  const { client } = await fetchDocument(Collection.CLIENT, clientId)

  if (!client) {
    console.log("No such client id ", clientId)
    return res.sendStatus(403)
  }

  const clientSecret = req.headers["mcp-client-secret"]
  const clientSecretHash = generateHash(clientSecret)

  if (client.clientSecretHash !== clientSecretHash) {
    console.log("hash mismatch")
    return res.sendStatus(403)
  }

  req.clientId = clientId

  next()
}
