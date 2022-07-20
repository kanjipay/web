const {auth} = require("./admin")

// Retrieve the correct user
auth.getUser("nsNmeQYBFSTZWBXu7Qqkxgdi6Y02").then(user => {
  const claims = user.customClaims

  console.log("claims: ", claims)
})