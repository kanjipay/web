import { getDownloadURL } from "firebase/storage"
import { useEffect, useRef, useState } from "react"
import { Colors } from "./CircleButton"
import SmallButton from "./SmallButton"

export default function ImagePicker({ height = 200, aspectRatio = 2, name, value, onChange, isRemovable = true }) {
  const hiddenFileInput = useRef(null)
  const [preview, setPreview] = useState(null)

  const handleAddFile = event => {
    hiddenFileInput.current.click()
  }

  useEffect(() => {
    if (value) { 
      if (value instanceof File) {
        const objectUrl = URL.createObjectURL(value)
        setPreview(objectUrl)
        return () => URL.revokeObjectURL(value)
      } else {

        getDownloadURL(value).then(url => {
          setPreview(url)
        })
      }
      
    } else {
      setPreview(null)
    }
  }, [value])

  const onChangeFile = event => {
    event.preventDefault()
    const fileUploaded = event.target.files[0]
    onChange({ target: { name, value: fileUploaded }})
  }

  const handleRemoveFile = event => {
    onChange({ target: { name, value: null } })
  }

  const pickerStyle = { 
    height, 
    width: height * aspectRatio, 
    backgroundColor: Colors.OFF_WHITE_LIGHT, 
    cursor: "pointer",
    position: "relative"
  }

  return <div style={pickerStyle}>
    <input style={{ width: 0, height: 0 }} />
    
    {
      preview ? 
        <img src={preview} alt="" style={{ position: "absolute", height: "100%", width: "100%", objectFit: "cover" }} /> :
        <p className="text-body-faded" style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)" }}>Upload an image</p>
    }

    <div onClick={handleAddFile} style={{ position: "absolute", height: "100%", width: "100%", top: 0 }}></div>
    
    {
      preview && isRemovable && <div style={{ position: "absolute", right: 16, bottom: 16 }}>
        <SmallButton
          title="Remove"
          onClick={handleRemoveFile}
        />
      </div>
    }
    
    <input
      type="file"
      name={name}
      style={{ display: "none", position: "absolute" }}
      ref={hiddenFileInput}
      onChange={onChangeFile}
      accept="image/*"
    />
  </div>
}