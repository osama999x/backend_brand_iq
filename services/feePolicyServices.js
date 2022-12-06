const feePolicyModel = require("../model/feePolicyModel");
const projection = require("../config/mongoProjection");
const mongoose = require("mongoose");
// const productsImagesModel = require("../model/productsImagesModel");

const feePolicyServices = {
  get: async () => {
    const result = await feePolicyModel
      .find()
      .populate({
        path: "membershipCategory",
        select: { membershipCategory: 1, _Id: 1 },
      })
      .populate({
        path: "feeSlab",
        select: { feeSlabFrom: 1, feeSlabTo: 1, _Id: 1 },
      });
    return result;
  },
  addNew: async (feeSlab, membershipCategory, charges) => {
    const data = new feePolicyModel({
      feeSlab: mongoose.Types.ObjectId(feeSlab),
      membershipCategory: mongoose.Types.ObjectId(membershipCategory),
      charges,
    });
    const result = await data.save();
    return result;
  },
  update: async (_id, feeSlab, membershipCategory, isPercentage, charges) => {
    result = await feePolicyModel.findOneAndUpdate(
      { _id },
      {
        feeSlab: mongoose.Types.ObjectId(feeSlab),
        membershipCategory: mongoose.Types.ObjectId(membershipCategory),
        isPercentage,
        charges,
      },
      {
        new: true,
      }
    );
    return result;
  },
  delete: async (_id) => {
    let result = await feePolicyModel.deleteOne({ _id });
    return result;
  },
};

module.exports = feePolicyServices;
