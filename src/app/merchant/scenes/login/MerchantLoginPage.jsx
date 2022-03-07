import { useState } from 'react';
import { Authentication, authenticateWithEmailAndPassword }  from '../../../../utils/services/FirestoreAuth'
import PasswordForm from "../../../../components/PasswordForm"


function MerchantLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = () => {
    const authentication = Authentication();
    authenticateWithEmailAndPassword(authentication, email, password)
      .then((response) => {
        localStorage.setItem(
          "Auth_Token",
          response._tokenResponse.refreshToken
        );
      })
      .catch(() => {
        setError("auth-failed");
        console.log("authentication failed for email", email);
      });
  };

  //TODO make this look not terrible
  return (
    <div className="login-form">
      <div>
        <div className="heading-container"></div>
      </div>

      <PasswordForm
        title="Login"
        setEmail={setEmail}
        setPassword={setPassword}
        handleAction={() => handleLogin()}
      ></PasswordForm>
      {error === "auth-failed" && (
        <h2> Incorrect email or password, please try again </h2>
      )}
      <p>
        {" "}
        <a href={`/merchant/signup`} target="_blank" rel="noopener noreferrer">
          Don't have an account yet? Sign up today!
        </a>{" "}
      </p>
    </div>
  );
}

export default MerchantLogin;
