import { getDownloadURL } from "firebase/storage";
import { useEffect, useState } from "react";
import { Colors } from "../enums/Colors";

export default function AsyncImage({ imageRef, alt = "", ...props }) {
  const [url, setUrl] = useState(null);

  useEffect(() => {
    getDownloadURL(imageRef)
      .then((url) => {
        setUrl(url);
      })
      .catch((error) => {
        console.error(error);
      });
  }, [imageRef]);

  return url ? (
    <img src={url} alt={alt} {...props} style={{ objectFit: "cover", ...props.style }} />
  ) : (
    <div style={{ backgroundColor: Colors.OFF_WHITE_LIGHT }} {...props} />
  );
}
