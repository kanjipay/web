const { v4 } = require("uuid");
const uuid = v4;

const merchantIds = ["silvas", "sapling"];

let dayOfWeek = 1;
let openingHourRanges = [];

while (dayOfWeek <= 7) {
  for (const merchantId of merchantIds) {
    openingHourRanges.push({
      id: uuid(),
      data: {
        dayOfWeek,
        merchantId,
        openTime: 660,
        closeTime: 900,
      },
    });
  }

  dayOfWeek++;
}

module.exports = openingHourRanges;
