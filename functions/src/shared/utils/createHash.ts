import * as crypto from "crypto"

export function generateHash(value: string): string {
  return crypto.createHash("sha256").update(value, "utf-8").digest("hex")
}