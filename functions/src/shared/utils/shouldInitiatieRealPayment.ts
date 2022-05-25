import Environment from "../enums/Environment";

export function shouldInitiateRealPayment() {
  const acceptedEnvironments: string[] = [Environment.PROD, Environment.STAGING]
  return acceptedEnvironments.includes(process.env.ENVIRONMENT)
}