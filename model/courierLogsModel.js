const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const schema = new Schema(
  {
    path: String,
    request: Object,
    response: Object,
  },
  { timestamps: true }
);

const courierLogsModel = new mongoose.model("courierLogs", schema);
module.exports = courierLogsModel;
