import { useState } from "react";
import {
  Authentication,
  authenticateWithEmailAndPassword,
} from "../../../utils/services/FirestoreAuth";
import PasswordForm from "../../../components/common/PasswordForm";

function MerchantLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = () => {
    const authentication = Authentication();
    authenticateWithEmailAndPassword(authentication, email, password).then(
      (response) => {
        localStorage.setItem(
          "Auth Token",
          response._tokenResponse.refreshToken
        );
      }
    );
  };

  // const handleLogin = () => {
  //   setPassword('success')
  // }

  return (
    <div className="login-form">
      <div>
        <div className="heading-container"></div>

        {/* <Box
                component="form"
                sx={{
                    '& > :not(style)': { m: 1, width: '25ch' },
                }}
                noValidate
                autoComplete="off"
            >
                <TextField
                    id="email"
                    label="Enter the Email"
                    variant="outlined"
                    onChange={(e) => setEmail(e.target.value)}
                />
                <TextField
                    id="password"
                    label="Enter the Password"
                    variant="outlined"
                    onChange={(e) => setPassword(e.target.value)}
                />
            </Box>

            <button title ='Login' onClick = {handleLogin} > </button> */}

        {/* <Button title="login" handleAction={handleAction}/> */}

        {/* <Button title={title} /> */}
      </div>

      <PasswordForm
        title="Login"
        setEmail={setEmail}
        setPassword={setPassword}
        handleAction={() => handleLogin()}
      ></PasswordForm>
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
