const membershipModel = require("../model/membershipModel");
const projection = require("../config/mongoProjection");
const mongoose = require("mongoose");
// const productsImagesModel = require("../model/productsImagesModel");

const membershipServices = {
  get: async () => {
    const result = await membershipModel
      .find({}, projection.projection)
      .limit(4)
      .sort({ membershipCategory: -1 });
    return result;
  },
  getMembershipCategories: async (_id) => {
    const result = await membershipModel.findById(
      { _id },
      projection.projection
    );
    return result;
  },

  addNew: async (membershipCategory, thresholdFrom, thresholdTo) => {
    const data = new membershipModel({
      membershipCategory,
      thresholdFrom,
      thresholdTo,
    });
    const result = await data.save();
    return result;
  },

  update: async (_id, thresholdFrom, thresholdTo) => {
    var _id = mongoose.Types.ObjectId(_id);
    result = await membershipModel.findOneAndUpdate(
      { _id: _id },
      {
        thresholdFrom,
        thresholdTo,
      },
      {
        new: true,
      }
    );
    return result;
  },
  delete: async (_id) => {
    var _id = mongoose.Types.ObjectId(_id);
    let result = await membershipModel.deleteOne({ _id: _id });
    return result;
  },
};

module.exports = membershipServices;
