import { Colors } from "../../enums/Colors";

export default function SignInWithAppleButton({ ...props }) {
  return <button
    {...props}
    test-id="apple-auth-button"
    style={{
      height: 48,
      width: "100%",
      backgroundColor: Colors.BLACK,
      display: "flex",
      outline: "none",
      alignItems: "center",
      justifyContent: "center",
      color: Colors.WHITE,
      fontWeight: 500,
      cursor: "pointer",
      columnGap: 8,
    }}
  >
    <img src="/img/apple.png" alt="" style={{ height: 20, width: 20 }} />
    Continue with Apple
  </button>
}