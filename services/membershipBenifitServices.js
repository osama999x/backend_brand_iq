const membershipBenifitModel = require("../model/membershipBenifitModel");
const projection = require("../config/mongoProjection");
const mongoose = require("mongoose");
const uploadFile = require("../utils/uploadFile");
// const productsImagesModel = require("../model/productsImagesModel");

const membershipBenifitServices = {
  get: async () => {
    const result = await membershipBenifitModel
      .find({}, projection.projection)
      .populate({
        path: "membershipCategory",
        select: { membershipCategory: 1 },
      });
    return result;
  },
  getMembershipCategories: async (_id) => {
    const result = await membershipBenifitModel
      .findById({ _id }, projection.projection)
      .populate({
        path: "membershipCategory",
        select: { membershipCategory: 1 },
      });
    return result;
  },

  addNew: async (membershipCategory, label, description, image, expireDate) => {
    image = await uploadFile(image);
    const data = new membershipBenifitModel({
      membershipCategory,
      label,
      description,
      image,
      expireDate,
    });
    const result = await data.save();
    return result;
  },

  update: async (
    _id,
    membershipCategory,
    label,
    description,
    image,
    expireDate
  ) => {
    if (image) {
      image = await uploadFile(image);
      var _id = mongoose.Types.ObjectId(_id);
      result = await membershipBenifitModel.findOneAndUpdate(
        { _id: _id },
        {
          membershipCategory,
          label,
          description,
          image,
          expireDate,
        },
        {
          new: true,
        }
      );
    } else {
      var _id = mongoose.Types.ObjectId(_id);
      result = await membershipBenifitModel.findOneAndUpdate(
        { _id: _id },
        {
          membershipCategory,
          label,
          description,
          image,
          expireDate,
        },
        {
          new: true,
        }
      );
    }
    return result;
  },
  delete: async (_id) => {
    var _id = mongoose.Types.ObjectId(_id);
    let result = await membershipBenifitModel.deleteOne({ _id: _id });
    return result;
  },
};

module.exports = membershipBenifitServices;
