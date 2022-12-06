const feeSlabModel = require("../model/feeSlabModel");
const projection = require("../config/mongoProjection");
const mongoose = require("mongoose");
// const productsImagesModel = require("../model/productsImagesModel");

const feeSlabServices = {
  get: async () => {
    const result = await feeSlabModel.find({}, projection.projection);
    return result;
  },
  addNew: async (membershipCategory, feeSlabFrom, feeSlabTo) => {
    const data = new feeSlabModel({
      membershipCategory: mongoose.Types.ObjectId(membershipCategory),
      feeSlabFrom,
      feeSlabTo,
    });
    const result = await data.save();
    return result;
  },
  update: async (_id, membershipCategory, feeSlabFrom, feeSlabTo) => {
    var _id = mongoose.Types.ObjectId(_id);
    result = await feeSlabModel.findOneAndUpdate(
      { _id },
      {
        membershipCategory: mongoose.Types.ObjectId(membershipCategory),
        feeSlabFrom,
        feeSlabTo,
      },
      {
        new: true,
      }
    );
    return result;
  },
  delete: async (_id) => {
    var _id = mongoose.Types.ObjectId(_id);
    let result = await feeSlabModel.deleteOne({ _id });
    return result;
  },
};

module.exports = feeSlabServices;
