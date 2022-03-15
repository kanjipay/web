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
    basePath: PlaidEnvironments.sandbox,
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

export async function createRecipient(accountNumber, sortCode, paymentName) {
  const recipientResponse =
    await plaidClient().paymentInitiationRecipientCreate({
      name: paymentName,
      bacs: {
        account: accountNumber,
        sort_code: sortCode,
      },
    });

  return recipientResponse.data;
}

export async function createPayment(recipientId, amountInPence) {
  const paymentResponse = await plaidClient().paymentInitiationPaymentCreate({
    recipient_id: recipientId,
    reference: "Mercado",
    amount: {
      value: amountInPence / 100,
      currency: PaymentAmountCurrency.Gbp,
    },
  });

  return paymentResponse.data;
}

export async function createLinkToken(paymentId, userId) {
  const linkResponse = await plaidClient().linkTokenCreate({
    user: {
      client_user_id: userId,
    },
    client_name: "Mercado",
    products: [Products.PaymentInitiation],
    country_codes: [CountryCode.Gb],
    language: "en",
    webhook: process.env.WEBHOOK_URL,
    payment_initiation: {
      payment_id: paymentId,
    },
  });

  return linkResponse.data;
}
