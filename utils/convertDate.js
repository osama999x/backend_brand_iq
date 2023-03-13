const moment = require("moment");

module.exports = (date) => {
  if (date) {
    return moment(date).format("YYYYMMDDhhmmss");
  }
  return null;
};
