const getCrezcoUserId = require("../getCrezcoUserId");

const payees = [
  {
    id: "trinityPayee",
    crezco: {
      userId: getCrezcoUserId()
    },
    accountNumber: "12341234",
    sortCode: "000000",
    approvalStatus: "APPROVED",
    companyName: "Trinity College Ball Committee",
    address: "Trinity College Cambridge",
    createdAt: new Date(),
    reviewedAt: new Date(),
  }
]

module.exports = payees