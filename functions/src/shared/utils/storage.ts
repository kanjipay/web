import { storage } from "./admin";
import * as fs from "fs"

export async function uploadFile(path: string, filename: string, base64String: string) {
  const bucket = storage().bucket()

  const localPath = `./uploads/${filename}`

  const destinationPath = `/${path}/${filename}`

  bucket.upload(localPath, {
    destination: destinationPath,
    metadata: {
      cacheControl: "public,max-age=3600000",
    }
  })

  fs.writeFile(filename, base64String, "base64", (err) => {

  })
  const file = bucket.file(path)
  const buffer = Buffer.from(base64String, "base64").toString("utf-8")

  try {
    await file.save(buffer)
  } catch (err) {
    console.log(err)
  }
}