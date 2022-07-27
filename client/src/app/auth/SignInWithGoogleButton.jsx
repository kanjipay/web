import { Colors } from "../../enums/Colors"

export function SignInWithGoogleButton({ style, ...props }) {
  return (
    <button
      {...props}
      test-id="google-auth-button"
      style={{
        height: 48,
        borderWidth: 1,
        borderColor: Colors.BLACK,
        width: "100%",
        borderStyle: "solid",
        backgroundColor: Colors.WHITE,
        display: "flex",
        outline: "none",
        alignItems: "center",
        justifyContent: "center",
        color: Colors.BLACK,
        fontWeight: 500,
        cursor: "pointer",
        columnGap: 8,
        ...style,
      }}
    >
      <img src="/img/google.png" alt="" style={{ height: 20, width: 20 }} />
      Continue with Google
    </button>
  )
}
