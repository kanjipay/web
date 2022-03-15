export function formatMinutes(mins) {
  const minsRemainder = (mins % 60).toLocaleString("en-GB", {
    minimumIntegerDigits: 2,
    useGrouping: false,
  });

  const hours = ((mins - minsRemainder) / 60).toLocaleString("en-GB", {
    minimumIntegerDigits: 2,
    useGrouping: false,
  });

  return `${hours}:${minsRemainder}`;
}

export function getWeekdays(locale) {
  var baseDate = new Date(Date.UTC(2017, 0, 2)); // just a Monday
  var weekDays = [];

  for (var i = 0; i < 7; i++) {
    weekDays.push(baseDate.toLocaleDateString(locale, { weekday: "long" }));
    baseDate.setDate(baseDate.getDate() + 1);
  }

  return weekDays;
}
