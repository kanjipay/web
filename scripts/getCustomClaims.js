const {auth} = require("./admin")

// Retrieve the correct user
auth.getUser("6Of3iiH3fbYlNIf0mX0nVHnzPfn1").then(user => {
  const claims = user.customClaims

  console.log("claims: ", claims)
})
/*
auth.setCustomUserClaims('6Of3iiH3fbYlNIf0mX0nVHnzPfn1', {
  '6d8a8316-c5a3-4b13-ab32-43dbeafe4656':'ADMIN'
}).then(console.log('done'))
*/