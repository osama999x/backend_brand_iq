const feedbackModel = require("../model/feedbackModel");
const productsModel = require("../model/productsModel");
const projection = require("../config/mongoProjection");
const mongoose = require("mongoose");
const customerModel = require("../model/customerModel");
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
  addNew: async ({ customerId, email, channel, rating, comments }) => {
    const normalizedEmail = (email || "").toString().trim().toLowerCase();

    // If email is provided, try to resolve customerId (works even without frontend knowing it)
    let resolvedCustomerId = customerId ? mongoose.Types.ObjectId(customerId) : null;
    if (!resolvedCustomerId && normalizedEmail) {
      const customer = await customerModel.findOne({ email: normalizedEmail }, { _id: 1 }).lean();
      if (customer) resolvedCustomerId = customer._id;
    }

    // Upsert rule:
    // - if we have customerId → one feedback per customerId
    // - else → one feedback per customerEmail (guest)
    const filter = resolvedCustomerId
      ? { customerId: resolvedCustomerId }
      : { customerEmail: normalizedEmail };

    const update = {
      channel,
      rating,
      comments,
      customerId: resolvedCustomerId,
      customerEmail: normalizedEmail,
    };

    const result = await feedbackModel.findOneAndUpdate(
      filter,
      { $set: update },
      { upsert: true, new: true }
    );
    return result;
  },
};

module.exports = feedbackServices;
