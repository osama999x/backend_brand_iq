const projection = require("../config/mongoProjection");
const mongoose = require("mongoose");
const dealsProductModel = require("../model/dealsProductModel");
const notificationModel = require("../model/notificationModel");
const readNotficationModel = require("../model/readNotificationModel");
const notificationInfo = require("../utils/notificationInfo");

const dealsProductServices = {
  get: async () => {
    const list = await dealsProductModel
      .find({}, projection.projection)
      .populate({
        path: "product",
        select: {
          name: 1,
          title: 1,
          images: 1,
          thumbnail: 1,
          variant: 1,
        },
      });
    return list;
  },
  todayList: async () => {
    let currentDate = new Date();
    currentDate = new Date(currentDate);
    const list = await dealsProductModel
      .find({ date: { $eq: currentDate } }, projection.projection)
      .populate({
        path: "product",
        select: {
          name: 1,
          title: 1,
          images: 1,
          thumbnail: 1,
          variant: 1,
        },
      });
    return list;
  },
  getOne: async (dealsId) => {
    let currentDate = new Date();
    currentDate = new Date(currentDate);
    let deal = await dealsProductModel
      .findById(
        { _id: dealsId, date: { $eq: currentDate } },
        projection.projection
      )
      .populate({
        path: "product",
        select: {
          name: 1,
          title: 1,
          images: 1,
          thumbnail: 1,
          variant: 1,
        },
      })
      .lean();
    // if (deal) {
    //   deal.product = deal.product.map((item) => {
    //     let variants = [];
    //     for (var i of item.variant) {
    //       sku = i.sku;
    //       actualPrice = i.actualPrice;
    //       variants.push({ sku: sku, actualPrice: actualPrice });
    //     }
    //     item.variant = variants;
    //     return item;
    //   });
    // }
    return deal;
  },
  addNew: async (dealTitle, product, discount, date) => {
    const deal = new dealsProductModel({
      dealTitle,
      product,
      discount,
      date,
    });
    const result = await deal.save();
    if (result) {
      dealTitle = result.dealTitle;
      date = result.date;
      date = date.toLocaleDateString();
      const notification = new notificationModel({
        title: notificationInfo.dealProduct.title,
        body: notificationInfo.dealProduct.body,
        message: `This deal ${dealTitle} has spacial discount. This offer for ${date} `,
        topic: "Spacial discount Offer",
        notificationType: "deal",
      });
      var notify = await notification.save();
      if (notify) {
        notify = notify._id;
        await readNotficationModel.updateMany(
          {},
          { $push: { readNotification: notify } }
        );
      }
    }
    return result;
  },
  update: async (_id, dealTitle, product, discount, date) => {
    date = new Date(date).toLocaleDateString();
    var _id = mongoose.Types.ObjectId(_id);
    var result = await dealsProductModel.findOneAndUpdate(
      { _id },
      { dealTitle, product, discount, date },
      { new: true }
    );

    return result;
  },
  delete: async (_id) => {
    var _id = mongoose.Types.ObjectId(_id);
    const result = await dealsProductModel.deleteOne({ _id });
    return result;
  },
};

module.exports = dealsProductServices;
