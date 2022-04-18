import * as jose from "node-jose";
import * as ms from "ms";
import {sha256} from 'js-sha256';
import * as jwt from 'jsonwebtoken';
import axios from 'axios';

async function sign(body, iatDelta) { 
  const keyStore = await jose.JWK.asKeyStore(process.env.JWKS_PRIVATE_KEY);
  const [key] = keyStore.all({ use: 'sig' });
  const opt = { compact: true, jwk: key, fields: { typ: 'jwt' } };
  const payload = await makePayload(body, iatDelta);
  const kid = await jose.JWS.createSign(opt, key).update(payload).final();
  return {
      alg: 'RS256',
      kid,
      typ: "JWT"
  }
};

async function makePayload(body, iatDelta){
const bodyHash = await sha256(body);
return JSON.stringify({
  exp: Math.floor((Date.now() + ms(iatDelta)) / 1000),
  iat: Math.floor(Date.now() / 1000),
  bodyHash
})
}


async function verify(token){
  const jwksUrl = `${process.env.BASE_SERVER_URL}/clientApi/jwks`;
  const response = await axios.get(jwksUrl);
  const publicKey = await response.data;
  const verified = await jwt.verify(token, publicKey)
  return verified
}

export default {sign, verify}