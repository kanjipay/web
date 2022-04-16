import { getDownloadURL, ref } from "firebase/storage";
import { storage } from "../../FirebaseUtils";

export function downloadTo(path, imgId, onComplete) {
  const imageRef = ref(storage, path);

  getDownloadURL(imageRef).then((url) => {
    const img = document.getElementById(imgId);
    img.setAttribute("src", url);

    onComplete();
  });
}
