import {
  Configuration,
  CountryCode,
  PaymentAmountCurrency,
  PlaidApi,
  PlaidEnvironments,
  Products,
} from "plaid";

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
  loggingClient
) {
  let plaidRedirectUri = "";

  if (process.env.ENVIRONMENT === "PROD") {
    plaidRedirectUri = "https://mercadopay.co/checkout/payment";
  } else if (isLocalEnvironment) {
    plaidRedirectUri = "http://localhost:3000/checkout/payment";
  } else {
    plaidRedirectUri = "https://mercadopay-dev.web.app/checkout/payment";
  }

  loggingClient.log("Plaid Link Token Configuration Set", {
    plaidRedirectUri: plaidRedirectUri,
    payment_id: payment_id,
    client_user_id: client_user_id,
    webhook: process.env.WEBHOOK_URL,
  });

  // const plaidRedirectUri =
  //   process.env.ENVIRONMENT === "PROD"
  //     ? "https://mercadopay.co/checkout/payment"
  //     : "https://mercadopay-dev.web.app/checkout/payment";

  try {
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
  } catch (err) {
    loggingClient.error("Make Link Token Error", {
      isLocalEnvironment: isLocalEnvironment,
      plaidRedirectUri: plaidRedirectUri,
      payment_id: payment_id,
      client_user_id: client_user_id,
      webhook: process.env.WEBHOOK_URL,
      error: err,
    });
  }
}

export async function makePlaidPayment(
  accountNumber: string,
  sortCode: string,
  paymentName: string,
  amount: number,
  userId: string,
  loggingClient,
  isLocalEnvironment: boolean
) {
  loggingClient.log("Making Plaid payment");

  const recipientId = await createRecipient(
    accountNumber,
    sortCode,
    paymentName
  );

  loggingClient.log(
    "Make Plaid recipientId complete",
    {},
    { recipientId }
  );

  const paymentId = await createPayment(recipientId, amount);

  loggingClient.log(
    "Plaid createPayment complete",
    {},
    { paymentId }
  );

  const linkResponse = await createLinkToken(
    paymentId,
    userId,
    isLocalEnvironment,
    loggingClient
  );

  const linkToken = linkResponse.link_token;
  const linkExpiration = linkResponse.expiration;

  loggingClient.log(
    "Make Plaid payment request complete",
    {},
    { linkToken }
  )

  return {
    providerData: {
      paymentId,
    },
    providerPrivateData: {
      recipientId,
      linkToken,
      linkExpiration,
    },
    providerReturnData: {
      linkToken,
    },
  };
}