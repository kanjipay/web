import { useEffect, useRef, useState } from "react"
import { Colors } from "../enums/Colors"
import SmallButton from "./SmallButton"
import Popup from "reactjs-popup"
import ReactCrop, { centerCrop, makeAspectCrop } from "react-image-crop"
import "react-image-crop/dist/ReactCrop.css"
import Spacer from "./Spacer"
import { v4 as uuid } from "uuid"
import { getDownloadURL } from "firebase/storage"

export default function ImagePicker({
  height = 200,
  aspectRatio = 2,
  name,
  value,
  onChange,
  isRemovable = true,
}) {
  const hiddenFileInput = useRef(null)

  function updateValue(update) {
    onChange({
      target: {
        name,
        value: {
          ...value,
          ...update,
        },
      },
    })
  }

  // Crop data
  const [crop, setCrop] = useState(null)
  const [isCropPopupOpen, setIsCropPopupOpen] = useState(false)
  const [cropBaseImage, setCropBaseImage] = useState(false)
  const [previewUrl, setPreviewUrl] = useState(null)
  const [cropPreviewUrl, setCropPreviewUrl] = useState(null)
  const [prevBaseFile, setPrevBaseFile] = useState(null)

  // Component UI data
  const [isHovering, setIsHovering] = useState(false)

  function generateImageCropperStyle(cropBaseImage) {
    if (!cropBaseImage) {
      return { width: 0, height: 0, aspectRatio: 1 }
    }

    const { naturalWidth: width, naturalHeight: height } = cropBaseImage
    const imageAspectRatio = width / height
    const imageCropperDimensions =
      width > height
        ? { width: "70vw", height: "auto" }
        : { width: "auto", height: "70vh" }

    return {
      ...imageCropperDimensions,
      imageAspectRatio,
    }
  }

  const imageCropperStyle = generateImageCropperStyle(cropBaseImage)

  useEffect(() => {
    const { baseFile, croppedFile, storageRef } = value

    const cleanupFunctions = []

    if (baseFile) {
      const cropPreviewUrl = URL.createObjectURL(baseFile)

      setCropPreviewUrl(cropPreviewUrl)

      cleanupFunctions.push(() => URL.revokeObjectURL(cropPreviewUrl))
    }

    if (croppedFile) {
      const previewUrl = URL.createObjectURL(croppedFile)

      setPreviewUrl(previewUrl)

      cleanupFunctions.push(() => URL.revokeObjectURL(previewUrl))
    } else if (storageRef) {
      getDownloadURL(storageRef).then((url) => {
        setPreviewUrl(url)

        if (!baseFile) {
          setCropPreviewUrl(url)
        }
      })
    } else {
      setPreviewUrl(null)
    }

    return () => {
      for (const cleanupFunction of cleanupFunctions) {
        cleanupFunction()
      }
    }
  }, [value])

  const handleAddFile = (event) => {
    hiddenFileInput.current.value = null
    hiddenFileInput.current.click()
  }

  const onChangeFile = (event) => {
    event.preventDefault()

    const { baseFile } = value

    setPrevBaseFile(baseFile)
    const stagedFile = event.target.files[0]

    updateValue({ baseFile: stagedFile })
    setIsCropPopupOpen(true)
  }

  const handleRemoveFile = (event) => {
    updateValue({
      baseFile: null,
      croppedFile: null,
    })
  }

  const onImageLoad = (event) => {
    const image = event.currentTarget
    const { naturalWidth: width, naturalHeight: height } = image

    const initialCrop = centerCrop(
      makeAspectCrop({ unit: "%", width: 90 }, 2, width, height),
      width,
      height
    )

    setCrop(initialCrop)
    setCropBaseImage(image)
  }

  const handleFinishCrop = async () => {
    const canvas = document.createElement("canvas")
    const scaleX = cropBaseImage.naturalWidth / cropBaseImage.width
    const scaleY = cropBaseImage.naturalHeight / cropBaseImage.height
    cropBaseImage.setAttribute("crossorigin", "anonymous")
    canvas.width = crop.width
    canvas.height = crop.height

    console.log("crop: ", crop)
    console.log("cropBaseImage: ", cropBaseImage)

    const context = canvas.getContext("2d")

    context.drawImage(
      cropBaseImage,
      crop.x * scaleX,
      crop.y * scaleY,
      crop.width * scaleX,
      crop.height * scaleY,
      0,
      0,
      crop.width,
      crop.height
    )

    const base64ImageUrl = canvas.toDataURL("image/jpeg", 1)

    const res = await fetch(base64ImageUrl)
    const blob = await res.blob()
    const croppedFile = new File([blob], uuid(), { type: "image/png" })

    setIsCropPopupOpen(false)
    updateValue({ croppedFile })
  }

  return (
    <div>
      <div
        style={{
          height,
          width: height * aspectRatio,
          backgroundColor: Colors.OFF_WHITE_LIGHT,
          cursor: "pointer",
          position: "relative",
          opacity: isHovering ? 0.95 : 1,
        }}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
        <input style={{ width: 0, height: 0 }} />

        {previewUrl ? (
          <img
            src={previewUrl}
            alt=""
            style={{
              position: "absolute",
              height: "100%",
              width: "100%",
              objectFit: "cover",
            }}
          />
        ) : (
          <p
            className="text-body-faded"
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
            }}
          >
            Upload an image
          </p>
        )}

        <div
          onClick={handleAddFile}
          style={{
            position: "absolute",
            height: "100%",
            width: "100%",
            top: 0,
          }}
        ></div>

        <div
          style={{
            display: "flex",
            position: "absolute",
            right: 16,
            bottom: 16,
            columnGap: 8,
          }}
        >
          {value && isRemovable && (
            <SmallButton title="Remove" onClick={handleRemoveFile} />
          )}
          {value && !isCropPopupOpen && (
            <SmallButton
              title="Crop"
              onClick={() => setIsCropPopupOpen(true)}
            />
          )}
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
        <Popup
          open={isCropPopupOpen}
          contentStyle={{
            width: "100vw",
            height: "100vh",
            backgroundColor: "#00000088",
            position: "relative",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              padding: 16,
              backgroundColor: Colors.WHITE,
            }}
          >
            <ReactCrop
              crop={crop}
              style={{ ...imageCropperStyle }}
              onChange={(crop, percentCrop) => setCrop(percentCrop)}
            >
              <img
                src={cropPreviewUrl}
                alt=""
                style={{ width: "100%", height: "100%" }}
                onLoad={onImageLoad}
              />
            </ReactCrop>
            <Spacer y={2} />
            <div style={{ display: "flex", columnGap: 8 }}>
              <SmallButton title="Confirm" onClick={handleFinishCrop} />
              <SmallButton
                title="Cancel"
                onClick={() => {
                  setIsCropPopupOpen(false)
                  updateValue({ baseFile: prevBaseFile })
                  setPrevBaseFile(null)
                }}
              />
            </div>
          </div>
        </Popup>
      }
    </div>
  )
}
