const mPromotionModel = require("../model/mPromotionModel");
const projection = require("../config/mongoProjection");
const uploadFile = require("../utils/uploadFile");
const mongoose = require("mongoose");
const promotionBuyerLogModel = require("../model/promotionBuyerLogModel");
const notificationModel = require("../model/notificationModel");
const readNotficationModel = require("../model/readNotificationModel");
const notificationInfo = require("../utils/notificationInfo");
const { promotion } = require("../utils/notificationInfo");

// const productsImagesModel = require("../model/productsImagesModel");

const mPromotionServices = {
  get: async () => {
    const result = await mPromotionModel
      .find({}, projection.projection)
      .populate({
        path: "promotion.category",
        select: { _id: 1, name: 1 },
      })
      .populate({
        path: "promotion.subcategory",
        select: { _id: 1, name: 1 },
      })
      .populate({
        path: "promotion.product",
        select: { _id: 1, name: 1 },
      });
    return result;
  },
  getPromtionProductDetail: async (_id) => {
    var result = await mPromotionModel
      .findById({ _id }, projection.projection)
      .populate({
        path: "promotion.category",
        select: { _id: 1, name: 1 },
      })
      .populate({
        path: "promotion.subcategory",
        select: { _id: 1, name: 1 },
      })
      .populate({
        path: "promotion.product",
        select: { _id: 1, name: 1, thumbnail: 1, variant: 1 },
      })
      .lean();
    if (result) {
      result.promotion = result.promotion.map((item) => {
        discount = item.discount;
        for (var i of item.product) {
          for (var j of i.variant) {
            j.promotionPrice = j.actualPrice - (discount / 100) * j.actualPrice;
          }
        }
        return item;
      });
    }
    return result;
  },
  getPromotionDetail: async (_id) => {
    const result = await mPromotionModel
      .findById({ _id }, projection.projection)
      .populate({
        path: "promotion.category",
        select: { _id: 1, name: 1 },
      })
      .populate({
        path: "promotion.subcategory",
        select: { _id: 1, name: 1 },
      })
      .populate({
        path: "promotion.product",
        select: { _id: 1, name: 1 },
      });
    // if (result) {
    //   result.promotion = result.promotion.map((item) => {
    //     for (var i of item.product) {
    //       productName = i.name;
    //     }
    //     item.productName = productName;
    //     delete item.product;
    //     return item;
    //   });
    // }
    return result;
  },
  addNew: async (campaignName, banner, promotion) => {
    if (banner.length === 0) {
      banner = null;
    }
    const data = new mPromotionModel({
      campaignName,
      banner,
      promotion,
    });
    const result = await data.save();
    if (result) {
      campaignName = result.campaignName;
      image = result.banner;
      const notification = new notificationModel({
        title: notificationInfo.promotion.title,
        body: notificationInfo.promotion.body,
        message: `This promotion campaign  ${campaignName} has spacial discount. This offer for limited time `,
        topic: "Spacial discount Offer",
        notificationType: "promotion",
        icon: image,
      });
      var notify = await notification.save();
      if (notify) {
        notify = notify._id;
        const up = await readNotficationModel.updateMany(
          {},
          { $push: { readNotification: notify } }
        );
        console.log(notify);
      }
    }
    return result;
  },
  update: async (_id, campaignName, banner, promotion) => {
    if (banner.length === 0) {
      banner = null;
    }
    result = await mPromotionModel.findOneAndUpdate(
      { _id: _id },
      {
        campaignName,
        banner,
        promotion,
      },
      {
        new: true,
      }
    );
    return result;
  },
  delete: async (_id) => {
    let result = await mPromotionModel.deleteOne({ _id: _id });
    if (result) {
      await promotionBuyerLogModel.deleteOne({ promotion: { $in: _id } });
    }
    return result;
  },
  promotionDetailById: async (_id) => {
    let result = await mPromotionModel
      .findById({ _id }, projection.projection)
      .populate({
        path: "promotion.product",
        select: { _id: 1, name: 1, variant: 1, thumbnail: 1 },
      })
      .lean();
    if (result) {
      result.promotion = result.promotion.map((item) => {
        var productArr = [];
        for (var i of item.product) {
          _id = i._id;
          productName = i.name;
          actualPrice = i.variant[0].actualPrice;
          discountedPrice = i.variant[0].discountedPrice;
          promotionDiscountedPrice = i.variant[0].actualPrice - item.discount;
          thumbnail = i.thumbnail;
          delete item.product;
        }
        item.productId = _id;
        item.productName = productName;
        item.actualPrice = actualPrice;
        item.discountedPrice = discountedPrice;
        item.promotionDiscountedPrice = promotionDiscountedPrice;
        item.thumbnail = thumbnail;
        delete item.product;
        return item;
      });
    }
    return result;
  },
};

module.exports = mPromotionServices;
