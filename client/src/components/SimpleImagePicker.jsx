import { useEffect, useRef, useState } from "react"
import { Colors } from "../enums/Colors"
import SmallButton from "./SmallButton"
import { getDownloadURL } from "firebase/storage"
import { isMobile } from "react-device-detect"

export default function SimpleImagePicker({
  height = 200,
  aspectRatio = 2,
  name,
  value = { file: null, storageRef: null },
  onChange,
  isRemovable = true,
}) {
  const hiddenFileInput = useRef(null)

  const [previewUrl, setPreviewUrl] = useState(null)
  const [isHovering, setIsHovering] = useState(false)

  // Set the preview URL
  useEffect(() => {
    const { file, storageRef } = value

    if (file) {
      const url = URL.createObjectURL(file)

      setPreviewUrl(url)

      return () => URL.revokeObjectURL(url)
    } else if (storageRef) {
      getDownloadURL(storageRef).then(setPreviewUrl)
    } else {
      setPreviewUrl(null)
    }
  }, [value])

  const handleAddFile = (event) => {
    hiddenFileInput.current.click()
  }

  const onChangeFile = (event) => {
    event.preventDefault()
    const file = event.target.files[0]
    onChange({ target: { name, value: { file } } })
  }

  const handleRemoveFile = (event) => {
    onChange({
      target: { name, value: { ...value, file: null, storageRef: null } },
    })
  }

  return (
    <div test-id={`image-picker-${name}`}>
      <div
        style={{
          aspectRatio: "2 / 1",
          width: isMobile ? "100%" : "auto",
          height: isMobile ? "auto" : 200,
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
          {(value.storageRef || value.file) && isRemovable && (
            <SmallButton title="Remove" onClick={handleRemoveFile} />
          )}
        </div>

        <input
          type="file"
          name={name}
          test-id={`image-picker-input-${name}`}
          style={{ display: "none", position: "absolute" }}
          ref={hiddenFileInput}
          onChange={onChangeFile}
          accept="image/*"
        />
      </div>
    </div>
  )
}
