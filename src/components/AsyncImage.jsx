import { getDownloadURL, ref } from "firebase/storage"
import { useEffect, useState } from "react";
import { storage } from "../utils/FirebaseUtils";
import { Colors } from "./CircleButton";

export default function AsyncImage({ imageRef, alt = '', ...props }) {
  const [url, setUrl] = useState(null)

  useEffect(() => {
    getDownloadURL(imageRef)
      .then(url => {
        setUrl(url)
      })
      .catch((error) => {
        console.error(error)
      })
  }, [imageRef])

  return url ?
    <img src={url} alt={alt} {...props} /> :
    <div style={{ backgroundColor: Colors.OFF_WHITE }} {...props}/>
}