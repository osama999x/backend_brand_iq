const express = require("express");
const expressAsyncHandler = require("express-async-handler");
const SubscribeModel = require("../model/subscribeModel");
const subscribeServices = require("../services/subscribeServices");
const subscribeRouter = express.Router();

subscribeRouter.get(
  "/",
  expressAsyncHandler(async (req, res) => {
    const result = await subscribeServices.get();
    res.status(200).send({
      msg: "Subscriber Lis",
      data: result,
    });
  })
);
subscribeRouter.get(
  "/getOne",
  expressAsyncHandler(async (req, res) => {
    const { subscriberId } = req.query;
    const result = await subscribeServices.getOne(subscriberId);
    if (result) {
      return res.status(200).send({
        msg: "Subscriber",
        data: result,
      });
    } else {
      return res.status(400).send({ msg: "Subscriber Not Found" });
    }
  })
);
subscribeRouter.post(
  "/",
  expressAsyncHandler(async (req, res) => {
    const { email } = req.body;
    if (!email) {
      return res.status(400).send({ msg: "Missing Fields" });
    }

    const check = await SubscribeModel.findOne({ email: email });
    if (check) {
      return res.status(200).send({
        msg: "You have already Subscribe. Thank You!",
      });
    } else {
      const result = await subscribeServices.add(email);
      if (result) {
        return res.status(200).send({
          msg: "Subscription added",
          data: result,
        });
      } else {
        return res.status(400).send({ msg: "Subscription Not added" });
      }
    }
  })
);

subscribeRouter.patch(
  "/",
  expressAsyncHandler(async (req, res) => {
    const { subscriberId, email } = req.body;
    if (!subscriberId || !email) {
      return res.status(400).send({ msg: "Missing Fields" });
    }
    const result = await subscribeServices.update(subscriberId, email);
    if (result) {
      return res.status(200).send({ msg: "tax type updated.", data: result });
    } else {
      return res.status(400).send({ msg: "Tax type not updated" });
    }
  })
);
subscribeRouter.delete(
  "/",
  expressAsyncHandler(async (req, res) => {
    const { subscriberId } = req.body;
    const result = await subscribeServices.delete(subscriberId);
    if (result.deletedCount == 0) {
      return res.status(400).send({ msg: "ID Not found" });
    }
    if (result) {
      return res.status(200).send({ msg: "tax type deleted.", data: result });
    } else {
      return res.status(400).send({ msg: "tax type not deleted" });
    }
  })
);

module.exports = subscribeRouter;
