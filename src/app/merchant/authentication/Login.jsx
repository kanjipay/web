import { useState } from 'react';
import { Authentication, authenticateWithEmailAndPassword }  from '../../../utils/services/FirestoreAuth'


function App() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = () => {
    const authentication = Authentication();
    authenticateWithEmailAndPassword(authentication, email, password)
    .then((response) => {
        localStorage.setItem('Auth Token', response._tokenResponse.refreshToken)
    })
}

  return (
    <div className="App">
        <Form
        title="Login"
        setEmail={setEmail}
        setPassword={setPassword}
        handleAction={() => handleLogin()}
        ></Form>
        <p>
          {" "}
          <a
            href={`/merchant/signup`}
            target="_blank"
            rel="noopener noreferrer"
          >
            Don't have an account yet? Sign up today! 
          </a>{" "}
        </p>
        </div>
  )
}

export default App;