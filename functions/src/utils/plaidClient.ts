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
  const configuration = new Configuration({
    basePath: process.env.ENVIRONMENT === 'PROD' ? PlaidEnvironments.development : PlaidEnvironments.sandbox,
    baseOptions: {
      headers: {
        "PLAID-CLIENT-ID": process.env.PLAID_CLIENT_ID,
        "PLAID-SECRET": process.env.PLAID_SECRET,
      },
    },
  });

  plaidInstance = new PlaidApi(configuration);

  return plaidInstance;
}

export const plaidClient = () => plaidInstance || getPlaid();

export async function createRecipient(accountNumber: string, sort_code: string, paymentName: string) {
  const res = await plaidClient().paymentInitiationRecipientCreate({
    name: paymentName,
    bacs: {
      account: accountNumber,
      sort_code,
    },
  });

  return res.data.recipient_id;
}

export async function createPayment(recipient_id: string, amountInPence: number) {
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

export async function createLinkToken(payment_id: string, client_user_id: string) {
  const res = await plaidClient().linkTokenCreate({
    user: {
      client_user_id,
    },
    client_name: "Mercado",
    products: [Products.PaymentInitiation],
    country_codes: [CountryCode.Gb],
    language: "en",
    webhook: `${process.env.WEBHOOK_URL}/plaid`,
    payment_initiation: {
      payment_id,
    },
  });

  return res.data;
}
