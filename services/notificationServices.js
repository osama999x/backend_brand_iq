const notificationModel = require("../model/notificationModel");
const readNotificationModel = require("../model/readNotificationModel");
const projection = require("../config/mongoProjection");
const notificationServices = {
  addNew: async (title, body, message, topic, notificationType, icon) => {
    const notification = new notificationModel({
      title,
      body,
      message,
      topic,
      notificationType,
      icon,
    });
    const result = await notification.save();
    if (result) {
      notify = result._id;
      await readNotificationModel.updateMany(
        {},
        { $push: { readNotification: notify } }
      );
    }
    return result;
  },
  getByTopic: async (notificationType) => {
    const list = await notificationModel
      .find({ notificationType })
      .sort("-createdAt");
    return list;
  },
  userNotification: async (page) => {
    var list = await notificationModel
      .find({}, projection.projection)
      .limit(10 * 1)
      .skip((page - 1) * 10)
      .sort("-createdAt");

    return list;
  },
};

module.exports = notificationServices;
