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

export function dateFromTimestamp(timestamp) {
  const seconds = timestamp.seconds ?? timestamp._seconds
  return new Date(seconds * 1000)
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

export function getTimeFromUnixTimestamp(UNIX_timestamp) {
  var a = new Date(UNIX_timestamp);
  var hour = a.getHours();
  var min = a.getMinutes();
  var paddedHour = hour < 10 ? "0" + hour : hour;
  var paddedMin = min < 10 ? "0" + min : min;
  var time = paddedHour + ":" + paddedMin;
  return time;
}

export function formatTimeForDisplayFromTimestamp(timestamp) {
  const hours = dateFromTimestamp(timestamp).getHours();
  const minutes = dateFromTimestamp(timestamp).getMinutes();

  var hoursString = "";
  var minutesString = "";

  if (hours < 10) {
    hoursString = "0" + String(hours);
  } else {
    hoursString = String(hours);
  }
  if (minutes < 10) {
    minutesString = "0" + String(minutes);
  } else {
    minutesString = String(minutes);
  }

  return hoursString + ":" + minutesString;
}
