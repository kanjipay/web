import {GoogleAuth} from 'google-auth-library';
import * as jwt from "jsonwebtoken"
import * as base64 from "base-64"

export type GoogleTicketDetails = {
  ticketId: string;
  header: string; 
  body: string; 
  ticketHolderName: string;
  qrCodeValue: string;
}

const CREDENTIALS = JSON.parse(base64.decode(process.env.SERVICE_ACCOUNT))
console.log(CREDENTIALS)
export async function createGooglePassUrl(classId: string, issuerId: string, ticketDetails: GoogleTicketDetails) {
  const httpClient = new GoogleAuth({
    credentials: CREDENTIALS,
    scopes: 'https://www.googleapis.com/auth/wallet_object.issuer'
  });
  const {ticketId, header, body, ticketHolderName, qrCodeValue} = ticketDetails
  const objectId = `${issuerId}.${ticketId.replace(/[^\w.-]/g, '_')}-${classId}`;
  const objectUrl = 'https://walletobjects.googleapis.com/walletobjects/v1/eventTicketObject/';
  const objectPayload = {
    "id":objectId,
    "classId": `${issuerId}.${classId}`,
    "textModulesData": [
      {
        header,
        body
      }
    ],
    "barcode": {
      "kind": "walletobjects#barcode",
      "type": "qrCode",
      "value": qrCodeValue
    },
    "state": "active",
    ticketHolderName,
  }
  const res = await httpClient.request({
    url: objectUrl,
    method: 'POST',
    data: objectPayload
  });
  console.log(res)
  const claims = {
    iss: CREDENTIALS.client_email,
    aud: 'google',
    origins: ['www.mercadopay.co'],
    typ: 'savetowallet',
    payload: {
      eventTicketObjects: [{
        id: objectId
      }],
    }
  };
  const token = jwt.sign(claims, CREDENTIALS.private_key, { algorithm: 'RS256' });
  console.log(token)
  return `https://pay.google.com/gp/v/save/${token}`;
}

