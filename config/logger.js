const { createLogger, format, transports } = require("winston");
const  winston=require("winston");
const moment = require("moment");
var date = new Date();
date = moment(date).format("YYYY-MM-DD");
const logFormat = format.printf(({ timestamp, level, message }) => {
  return JSON.stringify({ timestamp, level, message });
});
function logger(req, res, next) {
  const startTime = new Date();
  const logObject = {
    timestamp: startTime.toLocaleString(),
    path: req.path,
    method: req.method,
    request: req.body,
  };
  const oldSend = res.send;
  res.send = function (data) {
    logObject.response = JSON.parse(data);
    uploadLogs.info(logObject);
    oldSend.apply(res, arguments);
  };
  next();
}
const uploadLogs = createLogger({
  format: winston.format.combine(winston.format.json(), logFormat),
  transports: [new transports.File({ filename: `Daily_log/${date}.log` })],
});

module.exports= logger;
