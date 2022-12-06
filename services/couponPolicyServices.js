const couponPolicyModel = require("../model/couponPolicyModel");
const projection = require("../config/mongoProjection");
const uploadFile = require("../utils/uploadFile");

const mongoose = require("mongoose");
const couponStatusModel = require("../model/couponStatusModel");
const notificationModel = require("../model/notificationModel");
const notificationInfo = require("../utils/notificationInfo");
const readNotficationModel = require("../model/readNotificationModel");
// const productsImagesModel = require("../model/productsImagesModel");

const coupanPolicyServices = {
  get: async () => {
    var result = await couponPolicyModel.find({}, projection.projection);
    return result;
  },
  getValidCoupan: async (customerId) => {
    let couponArr = [];
    const usedCoupon = await couponStatusModel.find(
      { customer: customerId, isBuy: true },
      { couponCode: 1 }
    );
    for (var coupon of usedCoupon) {
      couponArr.push(coupon.coupanCode);
    }
    let currentDate = new Date().toLocaleDateString();
    currentDate = new Date(currentDate);
    var result = await couponPolicyModel.find(
      {
        activeTo: { $gte: currentDate },
        couponCode: { $nin: couponArr },
      },
      projection.projection
    );
    return result;
  },

  getCustomerCoupan: async (couponCode, customerId) => {
    const checkCustomer = await couponStatusModel.findOne({
      customer: customerId,
      couponCode: couponCode,
    });
    if (checkCustomer) {
      // const result = {
      //   msg: "You have already taken this coupon",
      //   isCoupan: false,
      // };
      throw "You have already taken this coupon";
    } else {
      const coupan = await couponPolicyModel.findOne({
        couponCode: couponCode,
      });
      if (!coupan) {
        // const result = {
        //   msg: "Coupan doesn't exist",
        //   isCoupan: false,
        // };
        throw "Coupon doesn't exist";
      } else {
        var today = new Date().toLocaleDateString();
        today = new Date(today);
        let result = await couponPolicyModel
          .findOne(
            {
              couponCode: couponCode,
              activeFrom: { $lte: today },
              activeTo: { $gte: today },
            },
            { couponValue: 1, _id: 0 }
          )
          .lean();
        if (result) {
          const data = new couponStatusModel({
            couponCode: couponCode,
            customer: mongoose.Types.ObjectId(customerId),
            isBuy: true,
          });
          const newData = await data.save();
          result.isCoupon = true;
          return result;
        } else {
          // const result = {
          //   msg: "Coupan expire",
          //   isCoupan: false,
          // };
          throw "Coupon expire";
        }
      }
    }
  },
  getOne: async (_id) => {
    var _id = mongoose.Types.ObjectId(_id);
    const result = await couponPolicyModel.findById({ _id });
    return result;
  },

  addNew: async (
    couponCode,
    image,
    activeFrom,
    activeTo,
    couponValue,
    isActive,
    isPercentage
  ) => {
    image = await uploadFile(image);
    activeFrom = new Date(activeFrom);
    activeTo = new Date(activeTo);
    const data = new couponPolicyModel({
      couponCode,
      image,
      activeFrom,
      activeTo,
      couponValue,
      isActive,
      isPercentage,
    });
    const result = await data.save();
    if (result) {
      activeFrom = result.activeFrom.toLocaleString();
      activeTo = result.activeTo.toLocaleString();
      couponCode = result.coupanCode;
      couponValue = result.coupanValue;
      image = result.image;
      console.log(image);
      const notification = new notificationModel({
        title: notificationInfo.coupon.title,
        body: notificationInfo.coupon.Body,
        message: `This Coupon  ${couponCode} has spacial discount of ${couponValue}.This offer for limited time start from ${activeFrom} and end ${activeTo}`,
        topic: "Spacial discount Offer",
        notificationType: "coupon",
        icon: image,
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
  update: async (
    _id,
    couponCode,
    image,
    activeFrom,
    activeTo,
    isActive,
    isPercentage,
    couponValue
  ) => {
    if (image) {
      image = await uploadFile(image);
      activeFrom = new Date(activeFrom);
      activeTo = new Date(activeTo);
      var result = await couponPolicyModel.findOneAndUpdate(
        { _id },
        {
          couponCode,
          image,
          activeFrom,
          activeTo,
          isActive,
          isPercentage,
          couponValue,
        },
        {
          new: true,
        }
      );
    } else {
      activeFrom = new Date(activeFrom);
      activeTo = new Date(activeTo);
      result = await couponPolicyModel.findOneAndUpdate(
        { _id },
        {
          couponCode,
          activeFrom,
          activeTo,
          isActive,
          isPercentage,
          couponValue,
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
    let result = await couponPolicyModel.deleteOne({ _id });
    return result;
  },
};

module.exports = coupanPolicyServices;
