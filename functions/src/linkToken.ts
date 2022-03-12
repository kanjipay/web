import * as plaid from 'plaid';

//initalise the Plaid client
const plaidConfiguration = new plaid.Configuration({
    basePath: plaid.PlaidEnvironments.sandbox,
    baseOptions: {
      headers: {
        'PLAID-CLIENT-ID': process.env.PLAID_CLIENT_ID,
        'PLAID-SECRET': process.env.PLAID_SECRET,
      },
    },
  })

const plaidClient = new plaid.PlaidApi(plaidConfiguration);  

async function createLinkToken(paymentName, accountNumber, sortCode, total, deviceId) {
    const recipientBody = {
        name: paymentName,
        bacs: {
          account: accountNumber,
          sort_code: sortCode
        }
      }
    console.log(recipientBody);
    const recipientResponse = await plaidClient.paymentInitiationRecipientCreate(recipientBody)
    const recipientResponseData = await recipientResponse.data;
    const paymentCreateBody = {
        recipient_id: recipientResponseData.recipient_id,
        reference: "Mercado",
        amount: {
          value: total,
          currency: plaid.PaymentAmountCurrency.Gbp
        }
      }
    console.log(paymentCreateBody);
    const paymentResponse = await plaidClient.paymentInitiationPaymentCreate(paymentCreateBody)
    const paymentResponseData = await paymentResponse.data;
    const linkTokenBody = {
        user: {
          client_user_id: deviceId
        },
        client_name: "Mercado",
        products: [plaid.Products.PaymentInitiation],
        country_codes: [plaid.CountryCode.Gb],
        language: "en",
        webhook: "http://localhost:3000",
        payment_initiation: {
            payment_id: paymentResponseData.payment_id
        }
      }
    console.log(linkTokenBody);
    const linkResponse = await plaidClient.linkTokenCreate(linkTokenBody)
    const linkTokenData = await linkResponse.data
    console.log(linkTokenData)
    const response = await {link_token:linkTokenData.link_token, payment_attempt_id:paymentResponseData.payment_id}
    return response
}

export {createLinkToken}