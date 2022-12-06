const notificationModel = require("../model/notificationModel");
const readNotificationModel = require("../model/readNotificationModel");
const projection = require("../config/mongoProjection");
const notificationServices = {
  addNew: async (title, body, message, topic) => {
    const notification = new notificationModel({
      title,
      body,
      message,
      topic,
    });
    const result = await notification.save();
    return result;
  },
  getByTopic: async (notificationType) => {
    const list = await notificationModel
      .find({ notificationType })
      .sort("-createdAt");
    return list;
  },
  userNotification: async (page) => {
    // let unreadNotification = await readNotificationModel.findOne(
    //   { customer: customerId },
    //   { readNotification: 1 }
    // );
    // if (unreadNotification) {
    //   unreadNotification = unreadNotification.readNotification;
    var list = await notificationModel
      .find({}, projection.projection)
      .limit(10 * 1)
      .skip((page - 1) * 10)
      .sort("-createdAt");
    // if (list.length != 0) {
    //   await readNotificationModel.findOneAndUpdate(
    //     { customer: customerId },
    //     { readNotification: [] }
    //   );
    // }
    return list;
    // }
    // return [];
  },
};

module.exports = notificationServices;
