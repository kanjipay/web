import { getDownloadURL, ref } from "firebase/storage"
import { useEffect, useState } from "react";
import { storage } from "../utils/FirebaseUtils";
import { Colors } from "./CircleButton";

export default function AsyncImage({ storagePath, alt = '', ...props }) {
  const [url, setUrl] = useState(null)

  useEffect(() => {
    const imageRef = ref(storage, storagePath)

    getDownloadURL(imageRef)
      .then(url => {
        setUrl(url)
      })
      .catch((error) => {
        console.error(error)
      })
  }, [storagePath])

  return url ?
    <img src={url} alt={alt} {...props} /> :
    <div style={{ backgroundColor: Colors.OFF_WHITE }} {...props}/>
}