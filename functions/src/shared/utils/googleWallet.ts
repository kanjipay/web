import {GoogleAuth} from 'google-auth-library';
import * as jwt from "jsonwebtoken"

export type GoogleTicketDetail = {
  ticketId: string;
  eventId: string;
  header: string; 
  body: string; 
  ticketHolderName: string;
}

async function  createGooglePassTicket(classId: string, issuerId: string, ticketDetail: GoogleTicketDetail, httpClient: GoogleAuth){
  const {ticketId, eventId, header, body, ticketHolderName} = ticketDetail
  const objectUrl = 'https://walletobjects.googleapis.com/walletobjects/v1/eventTicketObject/';
  const objectPayload = {
    "id":ticketId,
    eventId, 
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
      "value": ticketId
    },
    "state": "active",
    ticketHolderName,
  }
  return httpClient.request({
    url: objectUrl,
    method: 'POST',
    data: objectPayload
  });
}


export async function createGooglePassUrl(credentials, classId: string, issuerId: string, ticketDetails: Array<GoogleTicketDetail>) {
  const {client_email, private_key} = credentials
  const httpClient = new GoogleAuth({
    credentials,
    scopes: 'https://www.googleapis.com/auth/wallet_object.issuer'
  });
  const promises = []
  const ticketIds = []
  ticketDetails.forEach((ticketDetail) => {
    promises.push(createGooglePassTicket(classId, issuerId, ticketDetail, httpClient))
    ticketIds.push(ticketDetail.ticketId)
  })
  await Promise.all(promises)
  const claims = {
    iss: client_email,
    aud: 'google',
    origins: ['www.mercadopay.co'],
    typ: 'savetowallet',
    payload: {
      eventTicketObjects: [{
        id: ticketIds
      }],
    }
  };
  const token = jwt.sign(claims, private_key, { algorithm: 'RS256' });
  console.log(token)
  return `https://pay.google.com/gp/v/save/${token}`;
}

