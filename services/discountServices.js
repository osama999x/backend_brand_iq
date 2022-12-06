const discountModel = require("../model/discountModel");
const projection = require("../config/mongoProjection");
const mongoose = require("mongoose");
// const productsImagesModel = require("../model/productsImagesModel");

const discountServices = {
  get: async () => {
    const result = await discountModel
      .find()
      .populate({
        path: "category",
        select: { _id: 1, name: 1 },
      })
      .populate({
        path: "subcategory",
        select: { _id: 1, name: 1 },
      })
      .populate({
        path: "product",
        select: { _id: 1, name: 1 },
      });
    return result;
  },
  addNew: async (
    category,
    subcategory,
    product,
    originalPrice,
    discountPrice,
    fromDate,
    toDate
  ) => {
    const data = new discountModel({
      category: mongoose.Types.ObjectId(category),
      subcategory: mongoose.Types.ObjectId(subcategory),
      product,
      originalPrice,
      discountPrice,
      fromDate,
      toDate,
    });
    const result = await data.save();
    return result;
  },
  update: async (
    _id,
    category,
    subcategory,
    product,
    originalPrice,
    discountPrice,
    fromDate,
    toDate
  ) => {
    var _id = mongoose.Types.ObjectId(_id);
    result = await discountModel.findOneAndUpdate(
      { _id },
      {
        category: mongoose.Types.ObjectId(category),
        subcategory: mongoose.Types.ObjectId(subcategory),
        product,
        originalPrice,
        discountPrice,
        fromDate,
        toDate,
      },
      {
        new: true,
      }
    );
    return result;
  },
  delete: async (_id) => {
    var _id = mongoose.Types.ObjectId(_id);
    let result = await discountModel.deleteOne({ _id: _id });
    return result;
  },
};

module.exports = discountServices;
