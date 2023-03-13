const { createLogger, format, transports } = require("winston");
const moment = require("moment");
var date = new Date();
date = moment(date).format("YYYY-MM-DD");
const logger = createLogger({
  level: "info",
  format: format.combine(format.timestamp(), format.json()),
  //   format: winston.format.timestamp(),
  defaultMeta: { service: "user-service" },
  transports: [new transports.File({ filename: `Daily_log/${date}.log` })],
});
module.exports = logger;
