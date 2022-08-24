import { useState } from "react";
import { Colors } from "../../enums/Colors";
import { OAuthType } from "./SignInWithOAuthPage";

export default function SignInWithOAuthButton({ provider, style, ...props }) {
  const [isHovering, setIsHovering] = useState(false)
  let buttonColor

  switch (provider) {
    case OAuthType.APPLE:
      buttonColor = isHovering ? Colors.OFF_BLACK_LIGHT : Colors.BLACK
      break;
    default:
      buttonColor = isHovering ? Colors.OFF_WHITE_LIGHT : Colors.WHITE
      break;
  }

  return (
    <button
      {...props}
      test-id={`${provider.toLowerCase()}-auth-button`}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      style={{
        height: 48,
        borderWidth: 1,
        borderColor: Colors.BLACK,
        width: "100%",
        borderStyle: "solid",
        backgroundColor: buttonColor,
        display: "flex",
        outline: "none",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 2,
        color: provider === OAuthType.APPLE ? Colors.WHITE : Colors.BLACK,
        fontWeight: 500,
        cursor: "pointer",
        columnGap: 8,
        ...style,
      }}
    >
      <img src={`/img/${provider.toLowerCase()}.png`} alt="" style={{ height: 20, width: 20 }} />
      Continue with {provider}
    </button>
  )
}