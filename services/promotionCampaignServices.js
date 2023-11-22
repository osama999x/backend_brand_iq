const promotionCampaignModel = require("../model/promotionCampaignModel");
const projection = require("../config/mongoProjection");
const uploadFile = require("../utils/uploadFile");
const mongoose = require("mongoose");
const dealBuyerLogModel = require("../model/dealBuyerLogModel");
const notificationModel = require("../model/notificationModel");
const readNotficationModel = require("../model/readNotificationModel");
const notificationInfo = require("../utils/notificationInfo");
const { promotion } = require("../utils/notificationInfo");
const sendEmailNotificationInfo = require("../utils/sendEmailNotficationInfo");
const SubscribeModel = require("../model/subscribeModel");
const sendNotificationEmail = require("../utils/sendNotificationEmail");
const promotionModel = require("../model/promotionModel");
const promotionCampaignServices = {
  get: async () => {
    const now = new Date();
    const result = await promotionCampaignModel.find(
      {
        activeFrom: { $lte: now },
        activeTo: { $gte: now },
      },
      projection.projection
    );
    return result;
  },
  getWeb: async () => {
    const now = new Date();
    const result = await promotionCampaignModel.find(
      {
      },
      projection.projection
    );
    return result;
  },
  getPromotions: async () => {
    const result = await promotionModel
      .find({}, projection.projection)
      .populate({ path: "product", select: { _id: 1, name: 1 } })
      .populate({ path: "subcategory", select: { _id: 1, name: 1 } });
    return result;
  },
  getOneCampaign: async (campaignId) => {
    const campaign = await promotionCampaignModel.findById({ _id: campaignId });
    return campaign;
  },
  getOne: async (campaignId) => {
    const result = await promotionModel
      .find({ campaignId: { $in: campaignId } }, projection.projection)
      .populate({ path: "product", select: { _id: 1, name: 1 } })
      .populate({ path: "subcategory", select: { _id: 1, name: 1 } });
    return result;
  },
  getOnePromotion: async (promotionId) => {
    const result = await promotionModel
      .findById({ _id: promotionId }, projection.projection)
      .populate({ path: "product", select: { _id: 1, name: 1 } })
      .populate({ path: "subcategory", select: { _id: 1, name: 1 } });
    return result;
  },
  getPromtionProductDetail: async (_id) => {
    let currentDate = new Date(new Date().toLocaleDateString());
    let result = await promotionModel.aggregate([
      {
        $match: {
          _id: new mongoose.Types.ObjectId(_id),
          expireDate: { $gte: currentDate },
        },
      },
      {
        $lookup: {
          from: "products",
          localField: "product", // field in the orders collection
          foreignField: "_id", // field in the items collection
          as: "products",
        },
      },
      // { $unwind: "$product" },
      {
        $project: {
          _id: 1,
          discount: 1,
          campaignId: 1,
          products: 1,
        },
      },
    ]);
    if (result.length != 0) {
      discount = result[0].discount;
      result.products = result[0].products.map((item) => {
        for (var j of item.variant) {
          var price = j.actualPrice;
          j.discountedPrice = price - (price / 100) * discount;
        }
        return item;
      });
    }
    //aggregate([
    //   {
    //     $match: {
    //       _id: new mongoose.Types.ObjectId(_id),
    //       expireDate: { $gte: currentDate },
    //     },
    //   },
    //   { $unwind: "$product" },
    //   {
    //     $lookup: {
    //       from: "products",
    //       localField: "product", // field in the orders collection
    //       foreignField: "_id", // field in the items collection
    //       as: "products",
    //     },
    //   },
    //   { $unwind: "$product" },
    //   {
    //     $project: {
    //       _id: 1,
    //       discount: 1,
    //       campaignId: 1,
    //       products: 1,
    //     },
    //   },
    // ]);
    // if (result.length != 0) {
    //   result = result.map((item) => {
    //     discount = item.discount;
    //     for (var i of item.products) {
    //       name = i.name;
    //       title = i.title;
    //       thumbnail = i.thumbnail;
    //       actualPrice = i.variant[0].actualPrice;
    //       var discountedPrice = actualPrice - (actualPrice / 100) * discount;
    //     }
    //     item.name = name;
    //     item.title = title;
    //     item.thumbnail = thumbnail;
    //     item.actualPrice = actualPrice;
    //     item.promotionPrice = discountedPrice;
    //     delete item.products;
    //     return item;
    //   });
    // }
    return result;
  },
  addNew: async (campaignName, description, banner, activeFrom, activeTo) => {
    const data = new promotionCampaignModel({
      campaignName,
      banner,
      description,
      activeFrom,
      activeTo,
    });
    var result = await data.save();
    console.log("description", result.description);
    // if (result) {
    //   let subject = sendEmailNotificationInfo.promotion.title;
    //   let text = sendEmailNotificationInfo.promotion.body;
    //   // let email = await SubscribeModel.find({}, { email: 1, _id: 0 });
    //   // var emailArr = [];
    //   // for (var i of email) {
    //   //   email = i.email;
    //   //   emailArr.push(email);
    //   // }
    //   await sendNotificationEmail(subject, text);
    //   campaignName = result.campaignName;
    //   image = result.banner;
    //   const notification = new notificationModel({
    //     title: notificationInfo.promotion.title,
    //     body: notificationInfo.promotion.body,
    //     message: `This promotion campaign  ${campaignName} has spacial discount. This offer for limited time `,
    //     topic: "Spacial discount Offer",
    //     notificationType: "promotion",
    //     icon: image,
    //   });
    //   var notify = await notification.save();
    //   if (notify) {
    //     notify = notify._id;
    //     const up = await readNotficationModel.updateMany(
    //       {},
    //       { $push: { readNotification: notify } }
    //     );
    //   }
    // }
    return result;
  },
  addPromotion: async (
    campaignId,
    product,
    subcategory,
    expireDate,
    discount,
    status
  ) => {
    const promotion = new promotionModel({
      campaignId,
      product,
      subcategory,
      discount,
      expireDate,
      status,
    });
    const result = await promotion.save({
      product: { $ne: product },
    });
    return result;
  },
  update: async (
    _id,
    campaignName,
    description,
    banner,
    activeFrom,
    activeTo
  ) => {
    if (banner) {
      var result = await promotionCampaignModel.findOneAndUpdate(
        { _id: _id },
        {
          campaignName,
          description,
          banner,
          activeFrom,
          activeTo,
        },
        {
          new: true,
        }
      );
    } else {
      var result = await promotionCampaignModel.findOneAndUpdate(
        { _id: _id },
        {
          campaignName,
          description,
          activeFrom,
          activeTo,
        },
        {
          new: true,
        }
      );
    }

    return result;
  },
  updatePromotion: async (
    promotionId,
    product,
    subcategory,
    expireDate,
    discount,
    status
  ) => {
    const promotion = await promotionModel.findOneAndUpdate(
      { _id: promotionId },
      {
        product,
        subcategory,
        expireDate,
        discount,
        status,
      },
      { new: true }
    );
    return promotion;
  },
  delete: async (_id) => {
    let result = await promotionCampaignModel.deleteOne({ _id: _id });
    if (result) {
      await promotionModel.deleteMany({ campaignId: _id });
      //  await dealBuyerLogModel.deleteOne({ promotion: { $in: _id } });
    }
    return result;
  },
  deletePromotion: async (_id) => {
    let result = await promotionModel.deleteOne({ _id });
    return result;
  },
  promotionDetailById: async (_id) => {
    let currentDate = new Date(new Date().toLocaleDateString());
    let result = await promotionModel.aggregate([
      {
        $match: {
          campaignId: new mongoose.Types.ObjectId(_id),
          expireDate: { $gte: currentDate },
        },
      },
      {
        $lookup: {
          from: "subcategories",
          localField: "subcategory", // field in the orders collection
          foreignField: "_id", // field in the items collection
          let: { subcategory: "$subcategory" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ["$$subcategory", "$_id"],
                },
              },
            },
            {
              $project: { _id: 1, name: 1, description: 1, icon: 1 },
            },
          ],
          as: "subcategory",
        },
      },
      { $unwind: "$subcategory" },
      {
        $project: {
          _id: 1,
          campaignId: 1,
          discount: 1,
          subcategory: 1,
        },
      },
    ]);

    // aggregate([
    //   {
    //     $match: {
    //       campaignId: new mongoose.Types.ObjectId(_id),
    //       expireDate: { $gte: currentDate },
    //     },
    //   },
    //   { $unwind: "$product" },
    //   {
    //     $lookup: {
    //       from: "products",
    //       localField: "product", // field in the orders collection
    //       foreignField: "_id", // field in the items collection
    //       as: "products",
    //     },
    //   },
    //   { $unwind: "$product" },
    //   {
    //     $project: {
    //       _id: 1,
    //       discount: 1,
    //       campaignId: 1,
    //       products: 1,
    //     },
    //   },
    // ]);
    //  if (result.length != 0) {
    //   result = result.map((item) => {
    //     discount = item.discount;
    //     for (var i of item.products) {
    //       name = i.name;
    //       title = i.title;
    //       thumbnail = i.thumbnail;
    //       actualPrice = i.variant[0].actualPrice;
    //       var discountedPrice = actualPrice - (actualPrice / 100) * discount;
    //     }
    //     item.name = name;
    //     item.title = title;
    //     item.thumbnail = thumbnail;
    //     item.actualPrice = actualPrice;
    //     item.promotionPrice = discountedPrice;
    //     delete item.products;
    //     return item;
    //   });
    // }
    return result;
  },
};

module.exports = promotionCampaignServices;
