import Collection from "../../shared/enums/Collection"
import { generateHash } from "../../shared/utils/createHash"
import { fetchDocument } from "../../shared/utils/fetchDocument"


export const checkClientCredentials = async (req, res, next) => {
  // This middleware should check for client id and client secret in the header and verify it
  const clientId = req.headers["mcp-client-id"]

  if (!clientId) {
    return res.sendStatus(403)
  }

  const { client } = await fetchDocument(Collection.CLIENT, clientId)

  if (!client) {
    return res.sendStatus(403)
  }

  const clientSecret = req.headers["mcp-client-id"]
  const clientSecretHash = generateHash(clientSecret)

  if (client.clientSecretHash !== clientSecretHash) {
    return res.sendStatus(403)
  }

  req.clientId = clientId

  next()
}
