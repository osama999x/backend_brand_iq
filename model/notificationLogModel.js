const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const schema = new Schema(
  {
    customer: {
      type: Schema.Types.ObjectId,
      ref: "Customer",
    },
    notificationType: {
      type: String,
    },
    isSend: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const notificationLogModel = new mongoose.model("NotificationLog", schema);
module.exports = notificationLogModel;
