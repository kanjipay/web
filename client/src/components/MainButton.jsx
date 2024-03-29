import { useState } from "react"
import Spinner from "../assets/Spinner"
import { ButtonTheme } from "./ButtonTheme"
import "./MainButton.css"
import { Colors } from "../enums/Colors"
import { FeedbackProvider } from "../app/auth/AuthPage"

export default function MainButton({
  buttonTheme = ButtonTheme.MONOCHROME,
  title,
  icon,
  sideMessage,
  style,
  isLoading = false,
  onClick,
  ...props
}) {
  return <FeedbackProvider>{(isHovering, isPressed) => {
    let backgroundColor

    if (props.disabled) {
      backgroundColor = buttonTheme.disabledBackgroundColor
    } else if (isPressed || isHovering) {
      backgroundColor = buttonTheme.pressedBackgroundColor
    } else {
      backgroundColor = buttonTheme.backgroundColor
    }

    const foregroundColor = props.disabled
      ? buttonTheme.disabledForegroundColor
      : buttonTheme.foregroundColor

    const buttonStyle = {
      backgroundColor,
      height: 48,
      width: "100%",
      border: `2px solid ${buttonTheme.borderColor}`,
      display: "flex",
      outline: "none",
      boxSizing: "border-box",
      alignItems: "center",
      justifyContent: "center",
      fontWeight: 500,
      columnGap: 8,
      borderRadius: 2,
      color: foregroundColor,
      cursor: props.disabled ? "mouse" : "pointer",
      ...style,
    }

    return <div className="relative">
      <button
        style={buttonStyle}
        onClick={isLoading ? undefined : onClick}
        {...props}
      >
        {
          !isLoading && !!icon && (
            typeof icon === "string" ?
              <img
                src={icon}
                alt=""
                style={{ height: 20, width: 20 }}
              /> :
              icon
          )
        }
        {!isLoading && title}
      </button>
      {isLoading && (
        <div className="centred">
          <Spinner length={32} color={foregroundColor} />
        </div>
      )}

      {sideMessage && (
        <div
          style={{
            position: "absolute",
            height: "100%",
            padding: "0px 16px",
            display: "flex",
            alignItems: "center",
            top: 0,
            right: 0,
            fontWeight: 500,
            borderRadius: "0 2px 2px 0",
            color: Colors.WHITE,
            backgroundColor: Colors.OFF_BLACK_LIGHT,
            cursor: props.disabled ? "mouse" : "pointer"
          }}
          onClick={isLoading ? undefined : onClick}
        >
          {sideMessage}
        </div>
      )}
    </div>
  }}</FeedbackProvider>
}
