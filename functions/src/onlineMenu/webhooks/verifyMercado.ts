import sha256 = require("sha256");
import LoggingController from "../../shared/utils/loggingClient";
import { verifyMercadoSignature } from "../../shared/utils/verifyMercadoSignature";

export const verifyMercado = async (req, res, next) => {
  const logger = new LoggingController("Verifying Mercado webhook")

  const signature = req.headers["mcp-signature"]

  if (!signature) {
    logger.log("No signature found")
    return res.status(403).send("Unauthorized");
  }

  const { isVerified, payload } = await verifyMercadoSignature(signature)

  if (!isVerified) {
    logger.log("Could not verify signature")
    return res.status(403).send("Unauthorized");
  }

  logger.log("Verified signature", {}, { payload })

  const bodyString = JSON.stringify(req.body)
  const bodyHash = sha256(bodyString)

  if (bodyHash !== payload.body_sha_256) { 
    logger.log("Body hash mismatch")
    return res.status(403).send("Unauthorized");
  }

  next()
}