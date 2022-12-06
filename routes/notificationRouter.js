const express = require("express");
const notificatinoRouter = express.Router();
const asyncHandler = require("express-async-handler");
const notificationServices = require("../services/notificationServices");
const systemNotificationServices = require("../services/systemNotificationServices");
//adding a new system notificaion
notificatinoRouter.post(
  "/",
  asyncHandler(async (req, res) => {
    const { title, body, message, topic } = req.body;
    const result = await notificationServices.addNew(
      title,
      body,
      message,
      topic
    );
    if (result) {
      //sending notification to user with that topic
      await systemNotificationServices.systemNotification(body, title, topic, {
        message,
        name: "System Notification",
        id: result._id.toString(),
      });
      res.status(200).send({ msg: "success" });
    } else {
      res.status(400).send({ msg: "success" });
    }
  })
);

//geting notification with topic route
notificatinoRouter.get(
  "/get",
  asyncHandler(async (req, res) => {
    const { notificationType } = req.query;
    const result = await notificationServices.getByTopic(notificationType);
    res.status(200).send({ msg: "Notifications", data: result });
  })
);
notificatinoRouter.get(
  "/userNotification",
  asyncHandler(async (req, res) => {
    const { page } = req.query;
    try {
      const result = await notificationServices.userNotification(page);
      if (result.length != 0) {
        res.status(200).send({ msg: "Notifications", data: result });
      } else {
        res.status(200).send({ msg: "Notifications", data: result });
      }
    } catch (e) {
      res.status(200).send({ msg: e.message });
    }
  })
);

module.exports = notificatinoRouter;
