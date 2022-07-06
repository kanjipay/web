const isLocal = process.env.IS_LOCAL === "true";

export const baseUrl = isLocal
  ? "http://localhost:3000"
  : "https://mercadopay-dev.web.app"
