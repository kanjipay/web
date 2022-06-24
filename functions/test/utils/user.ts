import { auth } from "./admin";
const axios = require('axios').default;
const FIREBASE_API_KEY = 'AIzaSyD-5C67WE0VcPB-xQYiBdSYVFPd5OL3qTs';

export const createUserToken = async uid => {
  try {
    const customToken = await auth.createCustomToken(uid);
    const res = await axios({
      url: `https://www.googleapis.com/identitytoolkit/v3/relyingparty/verifyCustomToken?key=${FIREBASE_API_KEY}`,
      method: 'post',
      data: {
        token: customToken,
        returnSecureToken: true
      },
      json: true,
    });
    return res.data.idToken;


  } catch (e) {
    console.log(e);
  }
}
