const projection = require("../config/mongoProjection");
const mongoose = require("mongoose");
const subscribeModel = require("../model/subscribeModel");

const subscribeServices = {
  get: async () => {
    const list = await subscribeModel.find({}, projection.projection);
    return list;
  },
  getOne: async (_id) => {
    const resutl = await subscribeModel.findById(
      { _id },
      projection.projection
    );
    return resutl;
  },
  add: async (email) => {
    const data = new subscribeModel({ email });
    const result = await data.save();
    return result;
  },

  update: async (subscriberId, email) => {
    var _id = mongoose.Types.ObjectId(_id);
    const result = await subscribeModel.findOneAndUpdate(
      { _id: subscriberId },
      { email },
      { new: true }
    );
    return result;
  },
  delete: async (_id) => {
    var _id = mongoose.Types.ObjectId(_id);
    const result = await subscribeModel.deleteOne({ _id });
    return result;
  },
};

module.exports = subscribeServices;
