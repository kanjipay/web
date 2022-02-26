import { getDownloadURL, ref } from "firebase/storage"
import { useEffect } from "react";
import nextId from "react-id-generator";
import { storage } from "../FirebaseUtils";

export default function AsyncImage({ storagePath, alt, className }) {
  const imgId = nextId()

  useEffect(() => {
    const imageRef = ref(storage, storagePath)

    getDownloadURL(imageRef)
      .then(url => {
        const img = document.getElementById(imgId)
        img.setAttribute('src', url)
      })
      .catch((error) => {
        // Handle any errors
        console.error(error)
      })
  }, [storagePath, imgId])

  return <img className={className} id={imgId} alt={alt}/>
}