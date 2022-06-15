const {auth} = require("./admin")

// Retrieve the correct user
auth.getUser("6Li6Le9HArh5F1dJcMgr1nk78Fp2").then(user => {
  const claims = user.customClaims

  console.log("claims: ", claims)
})