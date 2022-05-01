import axios from "axios"
import * as jwt from "jsonwebtoken";
import * as jwkToPem from "jwk-to-pem";
import * as sha256 from "sha256";

export enum MercadoEnvironment {
  SANDBOX = "sandbox url",
  PRODUCTION = "production url"
}

export interface MercadoConfigurationParameters {
  clientId: string,
  clientSecret: string,
  environment: MercadoEnvironment,
  options: any
}

export interface LineItem {
  productId: string,
  quantity: number
}

interface RedirectUrlSet {
  success: string,
  failure: string,
  cancelled: string
}

export interface PaymentIntentCreateRequest {
  lineItems: LineItem[]
  redirectUrl?: string,
  redirectUrlSet?: RedirectUrlSet,
  userId?: string,
}

export class MercadoConfiguration {
  baseHeaders: any;
  baseUrl: string;

  constructor(params: MercadoConfigurationParameters) {
    this.baseHeaders = {
      "mco-client-id": params.clientId,
      "mco-client-secret": params.clientSecret
    }

    this.baseUrl = params.environment
  }
}



export class Mercado {
  private jwkCache = new Map()

  baseUrl: string;
  baseHeaders: any;

  constructor(config: MercadoConfiguration) {
    this.baseUrl = config.baseUrl
    this.baseHeaders = config.baseHeaders
  }

  public async createPaymentIntent(req: PaymentIntentCreateRequest) {
    const { lineItems, userId, redirectUrl, redirectUrlSet } = req

    const productIds = lineItems.map(i => i.productId)
    const quantities = lineItems.map(i => i.quantity)

    // This should be on the backend endpoint
    const areQuantitiesValid = quantities.every(quantity => {
      return quantity % 1 === 0 && quantity > 0 && quantity < 500
    })

    if (!areQuantitiesValid) {
      throw new Error("Invalid line item quantities")
    }

    const successUrl = redirectUrlSet?.success ?? redirectUrl
    const failureUrl = redirectUrlSet?.failure ?? redirectUrl
    const cancelledUrl = redirectUrlSet?.cancelled ?? redirectUrl

    if (!successUrl || !failureUrl || !cancelledUrl) {
      throw new Error("Must specify redirect URLs")
    }

    const res = await axios.post(
      `${this.baseUrl}/create-payment-intent`, 
      req, 
      {
        headers: {
          ...this.baseHeaders
        }
      }
    )
    const url = res.data.url

    return url
  }

  public verifyIp(ip: string) {
    const mercadoIps = [
      "123"
    ]
    
    return {
      verified: mercadoIps.includes(ip)
    }
  }

  public async verifyToken(token: string, requestBody: Object) {
    const errorObject = { verified: false }

    if (!token) {
      return errorObject
    }

    const { header } = jwt.decode(token, { complete: true });

    if (header.alg !== "ES256") {
      return errorObject;
    }

    const receivedKeyId = header.kid

    if (!this.jwkCache.has(receivedKeyId)) {
      const configRes = await axios.get("https://mercadopay.co/.well-known/config")
      const jwksUri = configRes.data.jwksUri
      const jwksRes = await axios.get(jwksUri)
      const jwks = jwksRes.data
      const loadedKeys = jwks.keys

      this.jwkCache.clear()

      for (const key of loadedKeys) {
        const keyId = key.kid
        this.jwkCache.set(keyId, key)
      }

      if (!this.jwkCache.has(receivedKeyId)) {
        return errorObject
      }
    }
    
    const key = this.jwkCache.get(receivedKeyId);
    const pem = jwkToPem(key);

    let payload

    try {
      payload = jwt.verify(token, pem)
    } catch (err) {
      return errorObject
    }

    const issuedAtSeconds = payload.iat;
    const claimedBodyHash = payload.request_body_sha256;

    if (
      !claimedBodyHash ||
      !issuedAtSeconds ||
      !(typeof issuedAtSeconds === "number")
    ) {
      return errorObject;
    }

    const issuedAt = new Date(issuedAtSeconds * 1000);
    const fiveMinsAgo = new Date(Date.now() - 5 * 60 * 1000);

    if (issuedAt < fiveMinsAgo) {
      return errorObject;
    }

    const bodyString = JSON.stringify(requestBody, null, 2);
    const bodyHash = sha256(bodyString);

    const verified = bodyHash === claimedBodyHash

    if (!verified) {
      return errorObject
    }

    return {
      verified: true,
      payload
    }
  }
}

const mercado = new Mercado(new MercadoConfiguration({
  clientId: "abc",
  clientSecret: "cba",
  environment: MercadoEnvironment.SANDBOX,
  options: {}
}))