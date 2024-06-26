export const formatedDateTime = () => {
  const date = new Date();

  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  const days = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  const monthsInFull = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const month = months[date.getMonth()];
  const day = date.getDate();
  let hour = date.getHours();
  const minute = date.getMinutes();

  const dayName = days[date.getDay()];
  const monthInFull = monthsInFull[date.getMonth()];
  const year = date.getFullYear();

  const ampm = hour >= 12 ? "PM" : "AM";

  hour = hour % 12;
  hour = hour ? hour : 12;

  const minuteStr = minute < 10 ? "0" + minute : minute;

  const timeStr = `${month} ${day} ${hour}:${minuteStr} ${ampm}`;

  return {
    timeStr,
    dateElements: {
      dayName,
      monthInFull,
      day,
      year,
    },
  };
};
