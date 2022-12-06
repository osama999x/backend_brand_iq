const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const schema = new Schema(
  {
    title: String,
    body: String,
    message: String,
    topic: String,
    notificationType: String,
    icon: {
      type: String,
      default: "images/notification.png",
    },
  },
  { timestamps: true }
);

const notificationModel = new mongoose.model("SystemNotification", schema);
module.exports = notificationModel;
