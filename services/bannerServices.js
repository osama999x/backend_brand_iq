const projection = require("../config/mongoProjection");
const uploadFile = require("../utils/uploadFile");
const mongoose = require("mongoose");
const bannerModel = require("../model/bannerModel");

const bannerServices = {
  get: async () => {
    const list = await bannerModel.find({}, projection.projection);
    return list;
  },
  addNew: async (banner, screenRefrence) => {
    var bannerArr = [];
    var bannerArrayLngth = banner.length;
    for (var i = 0; i < bannerArrayLngth; i++) {
      var icon = await uploadFile(banner[i]);
      bannerArr.push(icon);
    }
    const newBanner = new bannerModel({
      banner: bannerArr,
      screenRefrence,
    });
    const result = await newBanner.save();
    return result;
  },
  update: async (_id, banner, screenRefrence) => {
    if (banner.length != 0) {
      var bannerArr = [];
      for (var i of banner) {
        var icon = await uploadFile(i);
        bannerArr.push(icon);
      }
      var _id = mongoose.Types.ObjectId(_id);
      var result = await bannerModel.findOneAndUpdate(
        { _id },
        { banner: bannerArr, screenRefrence },
        { new: true }
      );
    } else {
      var _id = mongoose.Types.ObjectId(_id);
      var result = await bannerModel.findOneAndUpdate(
        { _id },
        { banner, screenRefrence },
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
