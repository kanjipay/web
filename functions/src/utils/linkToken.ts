import * as plaid from "plaid";

import { PaymentAttemptStatus, FireStoreCollection } from "./enums";
import { db } from "./firebase";

// some global details for payment
const CLIENT_NAME = 'Mercado';
const REFERENCE = 'Mercado';


//initalise the Plaid client
const plaidConfiguration = new plaid.Configuration({
  basePath: plaid.PlaidEnvironments.sandbox,
  baseOptions: {
    headers: {
      "PLAID-CLIENT-ID": process.env.PLAID_CLIENT_ID,
      "PLAID-SECRET": process.env.PLAID_SECRET,
    },
  },
});


const plaidClient = new plaid.PlaidApi(plaidConfiguration);

async function savePaymentData(paymentId, deviceId, amountGBP, recipientId, linkToken, expiration) {
  const paymentData = {
    payment_id: paymentId,
    status: PaymentAttemptStatus.PENDING,
    created_at: new Date(),
    device_id: deviceId,
    amount: amountGBP,
  }
  const paymentAttemptRef = await db
      .collection(FireStoreCollection.PAYMENT_ATTEMPT)
      .add(paymentData)
  await db
      .collection(FireStoreCollection.PRIVATE)
      .doc(paymentAttemptRef.path)
      .set({
        recipient_id: recipientId,
        link_token: linkToken,
        link_expiration: expiration
      });
}


async function createLinkToken(
  paymentName,
  accountNumber,
  sortCode,
  amountGBP,
  deviceId,
) {
  const recipientBody = {
    name: paymentName,
    bacs: {
      account: accountNumber,
      sort_code: sortCode,
    },
  };
  console.log(recipientBody);
  const recipientResponse = await plaidClient.paymentInitiationRecipientCreate(
    recipientBody
  );
  const recipientResponseData = await recipientResponse.data;
  const paymentCreateBody = {
    recipient_id: recipientResponseData.recipient_id,
    reference:  REFERENCE,
    amount: {
      value: amountGBP,
      currency: plaid.PaymentAmountCurrency.Gbp,
    },
  };
  console.log(paymentCreateBody);
  const paymentResponse = await plaidClient.paymentInitiationPaymentCreate(
    paymentCreateBody
  );
  const paymentResponseData = await paymentResponse.data;
  const linkTokenBody = {
    user: {
      client_user_id: deviceId,
    },
    client_name: CLIENT_NAME,
    products: [plaid.Products.PaymentInitiation],
    country_codes: [plaid.CountryCode.Gb],
    language: "en",
    webhook: process.env.PLAID_WEBOOK,
    payment_initiation: {
      payment_id: paymentResponseData.payment_id,
    },
  };
  console.log(linkTokenBody);
  const linkResponse = await plaidClient.linkTokenCreate(linkTokenBody);
  const linkTokenData = await linkResponse.data;
  console.log(linkTokenData);
  savePaymentData(paymentResponseData.payment_id, deviceId, amountGBP, recipientResponseData.recipient_id, linkTokenData.link_token, linkTokenData.link_token) 
  const response = await {
    link_token: linkTokenData.link_token,
    payment_attempt_id: paymentResponseData.payment_id,
  };
  return response;
}

export { createLinkToken }
