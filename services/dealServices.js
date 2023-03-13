const projection = require("../config/mongoProjection");
const mongoose = require("mongoose");
const dealModel = require("../model/dealModel");
const notificationModel = require("../model/notificationModel");
const readNotficationModel = require("../model/readNotificationModel");
const notificationInfo = require("../utils/notificationInfo");
const uploadFile = require("../utils/uploadFile");
const productModel = require("../model/productsModel");
const sendEmailNotificationInfo = require("../utils/sendEmailNotficationInfo");
const sendNotificationEmail = require("../utils/sendNotificationEmail");
const SubscribeModel = require("../model/subscribeModel");
const notificationServices = require("./notificationServices");

const dealServices = {
  get: async () => {
    const list = await dealModel.find({}, projection.projection);
    return list;
  },
  todayDealList: async () => {
    let currentDate = new Date().toLocaleDateString();
    currentDate = new Date(currentDate);
    console.log(currentDate);
    let list = await dealModel.find(
      {
        dealFrom: { $lte: currentDate },
        dealTo: { $gte: currentDate },
      },
      { buyDeal: 0, getDeal: 0 }
    );
    return list;
  },
  todayDeal: async () => {
    let currentDate = new Date().toLocaleDateString();
    currentDate = new Date(currentDate);
    let list = await dealModel.aggregate([
      {
        $match: {
          dealFrom: { $lte: currentDate },
          dealTo: { $gte: currentDate },
        },
      },
      {
        $project: {
          createdAt: 0,
          updatedAt: 0,
          dealFrom: 0,
          dealTo: 0,
          __v: 0,
        },
      },
      {
        $lookup: {
          from: "products",
          let: {
            product: "$buyDeal.product",
            sku: "$buyDeal.sku",
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $in: ["$_id", "$$product"],
                },
              },
            },
            {
              $project: {
                variant: {
                  $filter: {
                    input: "$variant",
                    as: "variant",
                    cond: { $in: ["$$variant.sku", "$$sku"] },
                  },
                },
              },
            },
          ],
          as: "buyDealDetails",
        },
      },
      {
        $lookup: {
          from: "products",
          let: { product: "$getDeal.product", sku: "$getDeal.sku" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $in: ["$_id", "$$product"],
                },
              },
            },
            {
              $project: {
                variant: {
                  $filter: {
                    input: "$variant",
                    as: "variant",
                    cond: { $in: ["$$variant.sku", "$$sku"] },
                  },
                },
              },
            },
          ],
          as: "getDealDetails",
        },
      },
    ]);
    if (list) {
      list = list.map((item) => {
        var buyDealPrice = 0;
        if (item.dealType === "today") {
          for (var j of item.buyDeal) {
            for (var i of item.buyDealDetails) {
              buyDealPrice += i.variant[0].actualPrice;
            }
          }
          var actualPrice = buyDealPrice;
          if (item.isPercentage === true) {
            buyDealPrice = buyDealPrice - (buyDealPrice / 100) * item.discount;
            item.discount = item.discount + "%";
          } else {
            buyDealPrice = buyDealPrice - item.discount;
            discount = (item.discount / buyDealPrice) * 100;
            discount = Math.ceil(discount) + "%";
            item.discount = discount;
          }
          item.actualPrice = actualPrice;
          item.buyDealPrice = buyDealPrice;
          delete item.buyDeal;
          delete item.buyDealDetails;
          delete item.getDeal;
          delete item.getDealDetails;
          delete item.isPercentage;
        }
        if (item.dealType === "other") {
          var totalPrice = 0;
          var buyTotal = 0;
          var getTotalPrice = 0;
          for (var j of item.buyDeal) {
            for (var i of item.buyDealDetails) {
              buyTotal += i.variant[0].actualPrice;
            }
          }
          for (var j of item.getDeal) {
            for (var i of item.getDealDetails) {
              getTotalPrice += i.variant[0].actualPrice;
            }
          }
          totalPrice = buyTotal + getTotalPrice;
          var discount = (getTotalPrice / totalPrice) * 100;
          discount = Math.ceil(discount) + "%";
          item.discount = discount;
          item.actualPrice = totalPrice;
          item.buyDealPrice = buyTotal;
          delete item.buyDeal;
          delete item.buyDealDetails;
          delete item.getDeal;
          delete item.getDealDetails;
        }
        return item;
      });
    }
    return list;
  },
  getOne: async (dealsId) => {
    let currentDate = new Date();
    currentDate = new Date(currentDate);
    let deal = await dealModel
      .findById(
        {
          _id: dealsId,
          dealFrom: { $lte: currentDate },
          dealTo: { $gte: currentDate },
        },
        projection.projection
      )
      .lean();
    if (deal) {
      var dealPrice = 0;
      for (var item of deal.buyDeal) {
        product = item.product;
        sku = item.sku;
        let dealDetails = await productModel.findOne(
          { _id: product },
          {
            variant: { $elemMatch: { sku: { $eq: sku } } },
            name: 1,
            title: 1,
            thumbnail: 1,
          }
        );
        item.buyDeal = dealDetails;
        dealPrice += dealDetails.variant[0].actualPrice * item.quantity;
        delete item.product;
        delete item.sku;
      }
      if (deal.dealType === "today") {
        if (deal.isPercentage === false) {
          deal.dealPrice = dealPrice - deal.discount;
        } else {
          deal.dealPrice = dealPrice - (dealPrice / 100) * deal.discount;
        }
      } else {
        deal.dealPrice = dealPrice;
      }
      if (deal.getDeal != 0) {
        for (var item of deal.getDeal) {
          product = item.product;
          sku = item.sku;
          let dealDetails = await productModel.findOne(
            { _id: product },
            {
              variant: { $elemMatch: { sku: { $eq: sku } } },
              name: 1,
              title: 1,
              thumbnail: 1,
            }
          );
          item.getDeal = dealDetails;
          delete item.product;
          delete item.sku;
        }
      }
    }
    return deal;
  },
  getOneWeb: async (dealsId) => {
    let deal = await dealModel.findById(
      {
        _id: dealsId,
      },
      projection.projection
    );
    return deal;
  },
  addNew: async (
    dealTitle,
    dealType,
    dealDescription,
    image,
    isPercentage,
    discount,
    dealFrom,
    dealTo
  ) => {
    if (image && dealType === "today") {
      image = await uploadFile(image);
      var todayDeal = new dealModel({
        dealTitle,
        dealType,
        dealDescription,
        isDeal,
        image,
        buyDeal,
        isPercentage,
        discount,
        dealFrom,
        dealTo,
      });
    } else {
      if (image) {
        image = await uploadFile(image);
      }
      var todayDeal = new dealModel({
        dealTitle,
        dealType,
        dealDescription,
        isDeal,
        image,
        buyDeal,
        getDeal,
        dealFrom,
        dealTo,
      });
    }
    const result = await todayDeal.save();
    if (result) {
      let subject = sendEmailNotificationInfo.dealProduct.title;
      let text = sendEmailNotificationInfo.dealProduct.body;
      await sendNotificationEmail(subject, text);
    }
    if (result && result.dealType === "today") {
      dealTitle = result.dealTitle;
      dealTo = result.dealTo;
      dealTo = dealTo.toLocaleDateString();
      image = result.image;
      title = notificationInfo.dealProduct.title;
      body = notificationInfo.dealProduct.body;
      message = `This deal ${dealTitle} has spacial discount. This offer for ${dealTo} `;
      topic = "Spacial discount Offer";
      notificationType = "deal";
      await notificationServices.addNew(
        title,
        body,
        message,
        topic,
        notificationType,
        image
      );
    } else {
      dealTitle = result.dealTitle;
      dealTo = result.dealTo;
      dealFrom = result.dealFrom;
      dealFrom = dealFrom.toLocaleDateString();
      dealTo = dealTo.toLocaleDateString();
      image = result.image;
      title = notificationInfo.dealProduct.title;
      body = notificationInfo.dealProduct.body;
      message = `This deal ${dealTitle} has spacial offer for buyer. This offer for limited time start from  ${dealFrom} and end ${dealTo} `;
      topic = "Spacial discount Offer";
      notificationType = "deal";
      await notificationServices.addNew(
        title,
        body,
        message,
        topic,
        notificationType,
        image
      );
    }
    return result;
  },
  update: async (
    _id,
    dealTitle,
    dealType,
    dealDescription,
    image,
    isPercentage,
    discount,
    dealFrom,
    dealTo
  ) => {
    if (image) {
      image = await uploadFile(image);
      var _id = mongoose.Types.ObjectId(_id);
      var result = await dealModel.findOneAndUpdate(
        { _id },
        {
          dealTitle,
          dealType,
          dealDescription,
          image,
          isPercentage,
          discount,
          dealFrom,
          dealTo,
        },
        { new: true }
      );
    } else {
      var _id = mongoose.Types.ObjectId(_id);
      var result = await dealModel.findOneAndUpdate(
        { _id },
        {
          dealTitle,
          dealType,
          dealDescription,
          isPercentage,
          discount,
          dealFrom,
          dealTo,
        },
        { new: true }
      );
    }
    return result;
  },
  delete: async (_id) => {
    var _id = mongoose.Types.ObjectId(_id);
    const result = await dealModel.deleteOne({ _id });
    return result;
  },
};

module.exports = dealServices;
