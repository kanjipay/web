import {GoogleAuth} from 'google-auth-library';
import * as jwt from "jsonwebtoken"
import * as base64 from "base-64"
import { logger } from 'firebase-functions/v1';

function getCredentials(){
  const credentials = JSON.parse(base64.decode(process.env.SERVICE_ACCOUNT))
  const issuerId = process.env.GOOGLE_WALLET_ISSUER_ID
  const httpClient = new GoogleAuth({
    credentials:credentials,
    scopes: 'https://www.googleapis.com/auth/wallet_object.issuer'
  });  
  return {credentials, issuerId, httpClient}
}

export type GoogleTicketDetail = {
  ticketId: string;
  eventId: string;
  header: string; 
  body: string; 
  ticketHolderName: string;
}

export async function createGooglePassEventClass(eventId: string, eventData){
  logger.log('creating event class')
  const {issuerId, httpClient} = getCredentials()
  const { merchantName, eventName, eventDate, description} = eventData
  const classUrl = 'https://walletobjects.googleapis.com/walletobjects/v1/eventTicketClass/';
  logger.log(eventDate) // todo add
  const id = `${issuerId}.${eventId}`
  const classPayload = {
    id,
    "issuerName":merchantName,
    "eventName": {
      "defaultValue": {
        "language": "en-US",
        "value": eventName
      },
      "textModulesData": [
      {
        "header": eventName,
        "body": description,
        "id": 'description'
      }],
      "EventDateTime":{'start':eventDate}
    },
    "reviewStatus": "underReview"
  };
  const result = await httpClient.request({
    url: classUrl,
    method: 'POST',
    data: classPayload
  });
  logger.log('tried making class')
  logger.log(result)
  logger.log({googlePassId:id})
  return id
}

async function  createGooglePassTicket(classId: string, ticketDetail: GoogleTicketDetail, id: string){
  const {issuerId, httpClient} = getCredentials()
  const {ticketId, eventId, header, body, ticketHolderName} = ticketDetail
  const objectUrl = 'https://walletobjects.googleapis.com/walletobjects/v1/eventTicketObject/';
  const objectPayload = {
    id,
    eventId, 
    "classId":`${issuerId}.${classId}`,
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
  await httpClient.request({
    url: objectUrl,
    method: 'POST',
    data: objectPayload
  });
}


export async function createGooglePassUrl(classId: string, ticketDetails: Array<GoogleTicketDetail>) {
  const {credentials, issuerId} = getCredentials()
  const {client_email, private_key} = credentials
  const promises = []
  const eventTicketObjects = []
  ticketDetails.forEach((ticketDetail) => {
    const id = `${issuerId}.${ticketDetail.ticketId.replace(/[^\w.-]/g, '_')}-${classId}`;
    promises.push(createGooglePassTicket(classId, ticketDetail, id))
    eventTicketObjects.push({id})
  })
  await Promise.all(promises)
  const claims = {
    iss: client_email,
    aud: 'google',
    origins: ['www.mercadopay.co'],
    typ: 'savetowallet',
    payload: {
      eventTicketObjects
    }
  };
  const token = jwt.sign(claims, private_key, { algorithm: 'RS256' });
  return `https://pay.google.com/gp/v/save/${token}`;
}


