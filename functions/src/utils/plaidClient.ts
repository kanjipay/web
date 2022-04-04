import {
  Configuration,
  CountryCode,
  PaymentAmountCurrency,
  PlaidApi,
  PlaidEnvironments,
  Products,
} from "plaid";
import * as functions from "firebase-functions";

let plaidInstance: PlaidApi | null = null;

function getPlaid() {
  //Hardcoding basepath to sandbox for testing
  // const basePath = PlaidEnvironments.sandbox;
  const basePath =
    process.env.ENVIRONMENT === "PROD"
      ? PlaidEnvironments.development
      : PlaidEnvironments.sandbox;

  const plaidSecret =
    process.env.ENVIRONMENT === "PROD"
      ? process.env.PLAID_SECRET
      : process.env.PLAID_SECRET_SANDBOX;

  const configuration = new Configuration({
    basePath: basePath,
    baseOptions: {
      headers: {
        "PLAID-CLIENT-ID": process.env.PLAID_CLIENT_ID,
        "PLAID-SECRET": plaidSecret, // Either PLAID_SECRET or PLAID_SECRET_SANDBOX,
      },
    },
  });

  functions.logger.log("Plaid Instance Initiated", {
    plaidEnvironment: basePath,
    apiEnvironment: process.env.ENVIRONMENT,
  });

  plaidInstance = new PlaidApi(configuration);

  return plaidInstance;
}

export const plaidClient = () => plaidInstance || getPlaid();

export async function createRecipient(
  accountNumber: string,
  sort_code: string,
  paymentName: string
) {
  const res = await plaidClient().paymentInitiationRecipientCreate({
    name: paymentName,
    bacs: {
      account: accountNumber,
      sort_code,
    },
  });

  return res.data.recipient_id;
}

export async function createPayment(
  recipient_id: string,
  amountInPence: number
) {
  const res = await plaidClient().paymentInitiationPaymentCreate({
    recipient_id,
    reference: "Mercado",
    amount: {
      value: amountInPence / 100,
      currency: PaymentAmountCurrency.Gbp,
    },
  });

  return res.data.payment_id;
}

export async function createLinkToken(
  payment_id: string,
  client_user_id: string,
  isLocalEnvironment: boolean,
  correlationId: string
) {
  let plaidRedirectUri = "";

  if (process.env.ENVIRONMENT === "PROD") {
    plaidRedirectUri = "https://mercadopay.co/checkout/payment";
  } else if (isLocalEnvironment) {
    plaidRedirectUri = "http://localhost:3000/checkout/payment";
  } else {
    plaidRedirectUri = "https://mercadopay-dev.web.app/checkout/payment";
  }

  functions.logger.log("Make Link Token Configuration Settings", {
    correlationId: correlationId,
    isLocalEnvironment: isLocalEnvironment,
    plaidRedirectUri: plaidRedirectUri,
    payment_id: payment_id,
    client_user_id: client_user_id,
    webhook: process.env.WEBHOOK_URL,
  });

  // const plaidRedirectUri =
  //   process.env.ENVIRONMENT === "PROD"
  //     ? "https://mercadopay.co/checkout/payment"
  //     : "https://mercadopay-dev.web.app/checkout/payment";

  const res = await plaidClient().linkTokenCreate({
    user: {
      client_user_id,
    },
    client_name: "Mercado",
    products: [Products.PaymentInitiation],
    country_codes: [CountryCode.Gb],
    language: "en",
    webhook: `${process.env.WEBHOOK_URL}/plaid`,
    redirect_uri: plaidRedirectUri,
    payment_initiation: {
      payment_id,
    },
  });

  return res.data;
}
