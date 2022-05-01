const fs = require("fs");
const jose = require("node-jose");

const keyStore = jose.JWK.createKeyStore();

keyStore.generate("RSA", 2048, { alg: "RS256", use: "sig" }).then((result) => {
  fs.writeFileSync(
    "keysPrivate.json",
    JSON.stringify(keyStore.toJSON(true), )
  );
  fs.writeFileSync(
    "keysPublic.json",
    JSON.stringify(keyStore.toJSON(), )
  );
});
