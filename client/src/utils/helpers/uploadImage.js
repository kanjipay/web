import Compress from "compress.js"
import { uploadBytes } from "firebase/storage"

const compress = new Compress()

export async function uploadImage(storageRef, file) {
  const [resizedImage] = await compress.compress([file], {
    quality: 0.75,
  })

  const resizedFile = Compress.convertBase64ToFile(
    resizedImage.data,
    resizedImage.ext
  )

  await uploadBytes(storageRef, resizedFile, {
    cacheControl: "public,max-age=3600000",
  })

  return
}
