import LoggingController from "../../../shared/utils/loggingClient";
import { verifyMercadoSignature } from "../../../shared/utils/verifyMercadoSignature";

export const verifyCrezco = async (req, res, next) => {
  const loggingClient = new LoggingController("Crezco Webhook");
  console.log(JSON.stringify(req.body[0]))
  console.log(req.body[0].partnerMetadata)
  const signature = req.body[0].partnerMetadata?.signature
  console.log(signature)

  if (!signature) {
    loggingClient.log("signature not present in metadata")
    return res.sendStatus(200)
  }

  const { isVerified, payload } = await verifyMercadoSignature(signature)

  if (!isVerified) {
    loggingClient.log("signature could not be verified")
    return res.sendStatus(200)
  }

  req.payload = payload

  next()
}