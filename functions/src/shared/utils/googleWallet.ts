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
  ticketHolderName: string;
}

export type GoogleEventData = {
  eventId: string, 
  merchantName: string, 
  eventName: string, 
  startDate: string, 
  description: string,
  location: string
}



export async function createGooglePassEventClass(eventData: GoogleEventData){
  logger.log('creating event class')
  const {issuerId, httpClient} = getCredentials()
  const classUrl = 'https://walletobjects.googleapis.com/walletobjects/v1/eventTicketClass/';
  logger.log({eventData}) 
  const id = `${issuerId}.${eventData.eventId}`
  const classPayload = {
    id,
    "issuerName":eventData.merchantName,
    "eventName": {
      "defaultValue": {
        "language": "en-US",
        "value": eventData.eventName
      },
    },
    "heroImage": {
        "sourceUri": {
          "uri": "https://mercadopay.co/img/festival_crowd.jpg",
          "description": "Mercado events"
        }
      },
      "textModulesData": [
        {
          "header":eventData.eventName,
          "body":eventData.description,
        }
      ],
      "venue": {
        "name": {
          "defaultValue": {
            "language": "en-US",
            "value": eventData.location
          }
        },
        "address": {
          "defaultValue": {
            "language": "en-US",
            "value": eventData.location
          }
        },
      },
    "dateTime":{"start":eventData.startDate},
    "reviewStatus": "underReview"
  };
  logger.log({classPayload})
  await httpClient.request({
    url: classUrl,
    method: 'POST',
    data: classPayload
  });
  logger.log({googlePassId:id})
  return id
}

async function  createGooglePassTicket(classId: string, ticketDetail: GoogleTicketDetail, id: string){
  const {issuerId, httpClient} = getCredentials()
  const {ticketId, eventId, ticketHolderName} = ticketDetail
  const objectUrl = 'https://walletobjects.googleapis.com/walletobjects/v1/eventTicketObject/';
  const objectPayload = {
    id,
    eventId, 
    "classId":`${issuerId}.${classId}`,
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
    const googlePassLink =  `https://pay.google.com/gp/v/save/${token}`;
    logger.log({googlePassLink});
    return googlePassLink

}
