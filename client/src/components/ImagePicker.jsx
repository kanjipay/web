import { getDownloadURL } from "firebase/storage"
import { useEffect, useRef, useState } from "react"
import { Colors } from "./CircleButton"
import SmallButton from "./SmallButton"
import Popup from "reactjs-popup"
import ReactCrop, { centerCrop, makeAspectCrop } from 'react-image-crop'
import 'react-image-crop/dist/ReactCrop.css'
import Spacer from "./Spacer"

export default function ImagePicker({ height = 200, aspectRatio = 2, name, value, onChange, isRemovable = true }) {
  const hiddenFileInput = useRef(null)
  const [preview, setPreview] = useState(null)
  const [isHovering, setIsHovering] = useState(false)
  const [isCropPopupOpen, setIsCropPopupOpen] = useState(false)
  const [file, setFile] = useState(null)
  const [crop, setCrop] = useState(null)
  const [dimensions, setDimensions] = useState({ width: 100, height: 50 })

  const handleAddFile = event => {
    hiddenFileInput.current.click()
  }

  useEffect(() => {
    if (value) { 
      if (value instanceof File) {
        const objectUrl = URL.createObjectURL(value)
        setPreview(objectUrl)
        setFile(value)
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
    setFile(fileUploaded)
    setIsCropPopupOpen(true)
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
    position: "relative",
    opacity: isHovering ? 0.95 : 1
  }

  const [src, setSrc] = useState(null)

  const onImageLoad = event => {
    const { naturalWidth: width, naturalHeight: height } = event.currentTarget;

    const aspectRatio = width / height

    const initialCrop = centerCrop(
      makeAspectCrop(
        { unit: "%", width: 90 },
        2,
        width,
        height
      ),
      width,
      height
    )

    setCrop(initialCrop)

    if (width > height) {
      setDimensions({ width: "80vw", height: "auto", aspectRatio })
    } else {
      setDimensions({ width: "auto", height: "80vh", aspectRatio })
    }
  }

  useEffect(() => {
    if (!file) { return }
    const src = URL.createObjectURL(file)
    setSrc(src)
  }, [file])

  const handleFinishCrop = () => {
    setIsCropPopupOpen(false)
    console.log(crop)
  }

  return <div>
    <div
      style={pickerStyle}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
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

      <div style={{ display: "flex", position: "absolute", right: 16, bottom: 16, columnGap: 8 }}>
        {
          preview && isRemovable && <SmallButton
            title="Remove"
            onClick={handleRemoveFile}
          />
        }
        {
          preview && !isCropPopupOpen && <SmallButton
            title="Crop"
            onClick={() => setIsCropPopupOpen(true)}
          />
        }
      </div>

      <input
        type="file"
        name={name}
        style={{ display: "none", position: "absolute" }}
        ref={hiddenFileInput}
        onChange={onChangeFile}
        accept="image/*"
      />
    </div>

    {
      value instanceof File && <Popup
        open={isCropPopupOpen}
        contentStyle={{
          width: "100vw",
          height: "100vh",
          backgroundColor: "#00000088",
          position: "relative"
        }}
      >
        <div
          style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)" }}
        >
          <ReactCrop
            crop={crop}
            onChange={(crop, percentCrop) => setCrop(percentCrop)}
          >
            <img src={src} alt="" style={dimensions} onLoad={onImageLoad} />
          </ReactCrop>
          <Spacer y={2} />
          <SmallButton title="Confirm" onClick={handleFinishCrop}/>
        </div>
        
      </Popup>
    }

    
  </div>
}