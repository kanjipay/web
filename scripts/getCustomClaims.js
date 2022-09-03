const {auth} = require("./admin")

// Retrieve the correct user
auth.getUser("xUvLREnvatenKgCiE8RmCGWK24u1").then(user => {
  console.log(user)
  const claims = user.customClaims

  console.log("claims: ", claims)
})