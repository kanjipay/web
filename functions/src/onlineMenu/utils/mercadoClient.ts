import axios from "axios";
import { OrderType } from "../../shared/enums/OrderType";

const mercadoBaseUrl = `${process.env.BASE_SERVER_URL}/clientApi/v1`

const defaultHeaders = {
  "mcp-client-id": process.env.MERCADO_CLIENT_ID,
  "mcp-client-secret": process.env.MERCADO_CLIENT_SECRET
}

export async function createMercadoPaymentIntent(amount: number, payeeId: string, currency: string, orderType: OrderType) {
  let subPath: string

  switch (orderType) {
    case OrderType.MENU:
      subPath = "menu"
      break;
    case OrderType.TICKETS:
      subPath = "events"
      break;
  }

  const successUrl = `${process.env.CLIENT_URL}/${subPath}/mcp-redirect`
  const cancelledUrl = `${process.env.CLIENT_URL}/${subPath}/mcp-redirect`

  const res = await axios.post(`${mercadoBaseUrl}/payment-intents`, {
    amount,
    payeeId,
    currency,
    successUrl,
    cancelledUrl
  }, {
    headers: defaultHeaders
  })

  const { paymentIntentId, checkoutUrl } = res.data

  return { paymentIntentId, checkoutUrl }
}