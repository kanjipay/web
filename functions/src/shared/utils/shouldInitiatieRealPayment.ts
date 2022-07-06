import { isStrictEnvironment } from "./isStrictEnvironment";

export function shouldInitiateRealPayment() {
  return isStrictEnvironment(process.env.ENVIRONMENT);
}
