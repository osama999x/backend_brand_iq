const express = require("express");
const expressAsyncHandler = require("express-async-handler");
const feedbackServices = require("../services/feedbackServices");
const feedbackRouter = express.Router();
feedbackRouter.get(
  "/all",
  expressAsyncHandler(async (req, res) => {
    const result = await feedbackServices.get();
    return res.status(200).send({
      msg: "FeedBack",
      data: result,
    });
  })
);
feedbackRouter.get(
  "/CustomerFeedback",
  expressAsyncHandler(async (req, res) => {
    const { customerId } = req.query;
    const result = await feedbackServices.getCustomerFeedback(customerId);
    if (result) {
      return res.status(200).send({
        msg: "FeedBack",
        data: result,
      });
    } else {
      return res.status(400).send({ msg: "FeedBack Not Found", data: result });
    }
  })
);
feedbackRouter.post(
  "/",
  expressAsyncHandler(async (req, res) => {
    const { customerId, channel, rating, comments } = req.body;
    if (!customerId || !rating) {
      return res.status(400).send({ msg: "Fields Missing" });
    }
    // if(channel===1){
    //  var mobile="Mobile App"
    // }else{
    //   var web="Web App"
    // }
    const result = await feedbackServices.addNew(
      customerId,
      channel,
      rating,
      comments
    );
    if (result) {
      return res.status(200).send({ msg: "FeedBack added.", data: result });
    } else {
      return res.status(400).send({ msg: "FeedBack not added" });
    }
  })
);

module.exports = feedbackRouter;
