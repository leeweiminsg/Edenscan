import moment from "moment";

export const getTodayDate = () => {
  return moment.utc(moment.utc().format("YYYY-MM-DD"));
};
