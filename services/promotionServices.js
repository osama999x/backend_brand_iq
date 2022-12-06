const promotionModel = require("../model/promotionModel");
const projection = require("../config/mongoProjection");
const uploadFile = require("../utils/uploadFile");
const mongoose = require("mongoose");
// const productsImagesModel = require("../model/productsImagesModel");

const promotionServices = {
  get: async () => {
    const result = await promotionModel
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
  getPromotionDetail: async (_id) => {
    const result = await promotionModel
      .findById({ _id }, projection.projection)
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
    campaignName,
    banner,
    discount,
    launchDate,
    endingDate
  ) => {
    if (banner.length === 0) {
      banner = null;
    }
    // var productId = product.map((item) => {
    //   product = item.product;
    //   return item;
    // });
    const data = new promotionModel({
      category: mongoose.Types.ObjectId(category),
      subcategory: mongoose.Types.ObjectId(subcategory),
      product,
      campaignName,
      banner,
      discount,
      launchDate,
      endingDate,
    });
    const result = await data.save();
    return result;
  },
  update: async (
    _id,
    category,
    subcategory,
    product,
    campaignName,
    banner,
    discount,
    launchDate,
    endingDate,
    status
  ) => {
    if (banner.length === 0) {
      banner = null;
    }
    // var productId = product.map((item) => {
    //   product = item.product;
    //   return item;
    // });
    result = await promotionModel.findOneAndUpdate(
      { _id: _id },
      {
        category: mongoose.Types.ObjectId(category),
        subcategory: mongoose.Types.ObjectId(subcategory),
        product,
        campaignName,
        banner,
        discount,
        launchDate,
        endingDate,
        status,
      },
      {
        new: true,
      }
    );
    return result;
  },
  delete: async (_id) => {
    let result = await promotionModel.deleteOne({ _id: _id });
    return result;
  },
};

module.exports = promotionServices;
