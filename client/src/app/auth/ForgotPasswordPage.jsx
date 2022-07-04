import { sendPasswordResetEmail } from "firebase/auth"
import { useNavigate } from "react-router-dom"
import Form, { generateValidator } from "../../components/Form"
import { Field } from "../../components/input/IntField"
import NavBar from "../../components/NavBar"
import Spacer from "../../components/Spacer"
import { auth } from "../../utils/FirebaseUtils"
import { validateEmail } from "../../utils/helpers/validation"

export default function ForgotPasswordPage() {
  const navigate = useNavigate()

  const handleSendPasswordResetEmail = (data) => {
    const { email } = data

    const redirectUrl = new URL(window.location.href)
    redirectUrl.pathname = "/auth/redirect"

    sendPasswordResetEmail(auth, email, {
      url: redirectUrl.href,
      handleCodeInApp: true,
    }).then(() => {
      navigate("password-reset-sent")
    })
  }

  return (
    <div className="container">
      <NavBar title="Forgot password" backPath="/auth" />
      <div className="content">
        <Spacer y={9} />

        <Form
          formGroupData={[
            {
              explanation:
                "Enter the email address you have an account with. We'll send you a password reset link if the account exists.",
              items: [
                {
                  name: "email",
                  validators: [
                    generateValidator(validateEmail, "Invalid email"),
                  ],
                  input: <Field type="email" />,
                },
              ],
            },
          ]}
          submitTitle="Send password reset email"
          onSubmit={handleSendPasswordResetEmail}
        />
        <Spacer y={6} />
      </div>
    </div>
  )
}
