const { auth } = require("./admin")

// Retrieve the correct user
auth.getUser("bKaSFTeFBPW4h18Foug1P7C3JY22").then(user => {
  const claims = user.customClaims

  console.log("claims: ", claims)
})