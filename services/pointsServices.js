const pointsModel = require("../model/pointsModel");
const projection = require("../config/mongoProjection");
const mongoose = require("mongoose");
// const productsImagesModel = require("../model/productsImagesModel");

const pointsServices = {
  get: async () => {
    const result = await pointsModel.find({}, projection.projection).populate({
      path: "membershipCategory",
      select: { membershipCategory: 1, _id: 1 },
    });
    return result;
  },
  getOne: async (_id) => {
    var _id = mongoose.Types.ObjectId(_id);
    const result = await pointsModel.findById({ _id: _id });
    return result;
  },

  addNew: async (membershipCategory, returnValue) => {
    const data = new pointsModel({
      membershipCategory: mongoose.Types.ObjectId(membershipCategory),
      returnValue,
    });
    const result = await data.save();
    return result;
  },
  update: async (_id, membershipCategory, returnValue) => {
    result = await pointsModel.findOneAndUpdate(
      { _id },
      {
        membershipCategory: mongoose.Types.ObjectId(membershipCategory),
        returnValue,
      },
      {
        new: true,
      }
    );
    return result;
  },
  delete: async (_id) => {
    var _id = mongoose.Types.ObjectId(_id);
    let result = await pointsModel.deleteOne({ _id });
    return result;
  },
};

module.exports = pointsServices;
