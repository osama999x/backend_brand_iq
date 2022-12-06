const feedbackModel = require("../model/feedbackModel");
const productsModel = require("../model/productsModel");
const projection = require("../config/mongoProjection");
const mongoose = require("mongoose");
// const productsImagesModel = require("../model/productsImagesModel");

const feedbackServices = {
  get: async () => {
    const result = await feedbackModel
      .find({}, projection.projection)
      .populate({
        path: "customerId",
        select: {
          _id: 1,
          firstName: 1,
          lastName: 1,
          contact: 1,
        },
      });
    return result;
  },
  getCustomerFeedback: async (customerId) => {
    const result = await feedbackModel
      .find({ customerId: { $in: customerId } }, projection.projection)
      .populate({
        path: "customerId",
        select: {
          _id: 1,
          firstName: 1,
          lastName: 1,
          contact: 1,
        },
      });
    return result;
  },
  addNew: async (customerId, channel, rating, comments) => {
    const findFeedBack = await feedbackModel.findOne({ customerId });
    if (findFeedBack) {
      const result = await feedbackModel.findOneAndUpdate(
        { customerId },
        {
          channel,
          rating,
          comments,
        },
        { new: true }
      );
      return result;
    } else {
      const data = new feedbackModel({
        customerId: mongoose.Types.ObjectId(customerId),
        channel,
        rating,
        comments,
      });
      const result = await data.save();
      return result;
    }
  },
};

module.exports = feedbackServices;
