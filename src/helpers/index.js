import moment from "moment";

export const getDifferenceInDays = (date1, date2) => {
  return moment.duration(date1.diff(date2)).asDays();
}

export const roundOff = (value) => {
  return Math.round((value + Number.EPSILON) * 100) / 100
}