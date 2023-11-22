const projection = require("../config/mongoProjection");
const uploadFile = require("../utils/uploadFile");
const mongoose = require("mongoose");
const bannerModel = require("../model/bannerModel");

const bannerServices = {
  get: async () => {
    const list = await bannerModel.find({}, projection.projection);
    return list;
  },
  addNew: async (banner, isPercentage, type, price) => {
    if (banner) {
      banner = await uploadFile(banner);
    }
    const newBanner = new bannerModel({
      banner,
      isPercentage,
      type,
      price,
    });
    const result = await newBanner.save();
    return result;
  },
  update: async (_id, banner, type, isPercentage, price) => {
    var result
    if (banner) {
      banner=uploadFile(banner)
       result = await bannerModel.findOneAndUpdate(
        { _id },
        {banner, type, isPercentage, price },
        { new: true }
      );
    } else {
       result = await bannerModel.findOneAndUpdate(
        { _id },
        {  type, isPercentage, price },
        { new: true }
      );
    }
    return result;
  },
  delete: async (_id) => {
    var _id = mongoose.Types.ObjectId(_id);
    const result = await bannerModel.deleteOne({ _id });
    return result;
  },
};

module.exports = bannerServices;
