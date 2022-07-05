import Environment from "../enums/Environment";

const strictEnvironments: string[] = [Environment.PROD, Environment.STAGING];

export function isStrictEnvironment(environment: string) {
  return strictEnvironments.includes(environment);
}
