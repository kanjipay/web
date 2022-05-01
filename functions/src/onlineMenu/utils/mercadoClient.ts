import axios from "axios";

const mercadoBaseUrl = `${process.env.BASE_SERVER_URL}/clientApi/v1`

const defaultHeaders = {
  "mcp-client-id": process.env.MERCADO_CLIENT_ID,
  "mcp-client-secret": process.env.MERCADO_CLIENT_SECRET
}

export async function createMercadoPaymentIntent(amount: number, payeeId: string) {
  const successUrl = `${process.env.CLIENT_URL}/mcp-redirect`
  const cancelledUrl = `${process.env.CLIENT_URL}/mcp-redirect`

  const res = await axios.post(`${mercadoBaseUrl}/payment-intents`, {
    amount,
    payeeId,
    successUrl,
    cancelledUrl
  }, {
    headers: defaultHeaders
  })

  const { paymentIntentId, checkoutUrl } = res.data

  return { paymentIntentId, checkoutUrl }
}