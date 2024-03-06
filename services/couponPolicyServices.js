const couponPolicyModel = require("../model/couponPolicyModel");
const projection = require("../config/mongoProjection");
const uploadFile = require("../utils/uploadFile");

const mongoose = require("mongoose");
const couponStatusModel = require("../model/couponStatusModel");
const notificationModel = require("../model/notificationModel");
const notificationInfo = require("../utils/notificationInfo");
const readNotficationModel = require("../model/readNotificationModel");
const couponProductModel = require("../model/couponProductModel");
const { find } = require("../model/registeredUserModel");
const SubscribeModel = require("../model/subscribeModel");
const sendNotificationEmail = require("../utils/sendNotificationEmail");
const sendEmailNotificationInfo = require("../utils/sendEmailNotficationInfo");
const notificationServices = require("./notificationServices");
const customerModel = require("../model/customerModel");
const { test } = require("./productsServices");
const moment = require('moment');
const { text } = require("body-parser");
// const productsImagesModel = require("../model/productsImagesModel");

const coupanPolicyServices = {
    get: async () => {
        var result = await couponPolicyModel.find({}, projection.projection).sort({ createdAt: -1 });
        return result;
    },
    getValidCoupon: async (customerId) => {
        try {
            const couponArr = [];
            const usedCoupons = await couponStatusModel.find(
                { customer: customerId, isBuy: true },
                { couponCode: 1 }
            );

            for (const coupon of usedCoupons) {
                couponArr.push(coupon.couponCode);
            }

            const currentDate = new Date();
            const validCoupons = await couponPolicyModel.find(
                {
                    activeTo: { $gte: currentDate },
                    couponCode: { $nin: couponArr },
                    isActive: true,
                },
                projection.projection
            );

            return validCoupons;
        } catch (error) {
            console.error("Error in getValidCoupon:", error);
            throw error;
        }
    },

    checkCustomerCoupon: async (couponCode, customerId) => {
        const checkCustomer = await couponStatusModel.findOne({
            customer: customerId,
            couponCode: couponCode,
            isBuy: true
        });

        return checkCustomer;
    },
    checkCoupon: async (couponCode) => {
        const result = await couponPolicyModel.findOne({ couponCode: couponCode });
        return result;
    },
    inActive: async (couponCode) => {
        const result = await couponPolicyModel.findOne({ couponCode: couponCode, isActive: false });
        return result;
    },
    getOrderLimit: async (couponCode, orderPriceLimit) => {

        const couponPolicy = await couponPolicyModel.findOne({ couponCode: couponCode });

        // if (!couponPolicy) {
        //     throw new Error('Coupon not found.');
        // }

        const isValid = orderPriceLimit >= couponPolicy.orderPriceLimit;

        return {
            isValid,
            couponDiscount: couponPolicy.couponValue,
            isPercentage: couponPolicy.isPercentage,
            orderPriceLimit: couponPolicy.orderPriceLimit,
        };
    },

    getValidCoupon: async (couponCode) => {
        let nowTime = moment().format('YYYY-MM-DDTHH:mm:ss.SSS[Z]');
        console.log("nowTime", nowTime);

        const result = await couponPolicyModel.findOne({ couponCode: couponCode });
        console.log("result.expireDate", moment(result.expireDate).format('YYYY-MM-DDTHH:mm:ss.SSS[Z]'));

        if (moment(nowTime).isBefore(moment(result.expireDate))) {
            return result;
        }
    }
    ,
    isbuy: async (couponCode, customerId) => {
        const redeemed = await couponStatusModel.findOne(
            { couponCode: couponCode, customer: customerId, isBuy: true }

        );
        // console.log("redeemed", redeemed);
        return redeemed;
    },

    useCoupon: async (couponCode, customerId) => {
        const usingCoupon = await couponPolicyModel.findOneAndUpdate({ couponCode: couponCode }, { isActive: true }, { upsert: true })
        let newCouponStatus = await couponStatusModel.findOneAndUpdate({
            couponCode: couponCode,
            customer: mongoose.Types.ObjectId(customerId)
        }, {
            isBuy: true,
        }, { upsert: true });
        await newCouponStatus.save();
        const savedCouponStatus = await newCouponStatus.save();

        const result = await savedCouponStatus.populate({ path: 'customer', model: 'Customer', select: "firstName lastName email" });

        return result;
    }
    ,

    getCustomerCoupon: async (couponCode) => {
        // const checkCustomer = await couponStatusModel.findOne({
        //   customer: customerId,
        //   couponCode: couponCode,
        // });
        // if (checkCustomer) {
        //   throw "You have already taken this coupon";
        // } else {
        //   const coupan = await couponPolicyModel.findOne({
        //     couponCode: couponCode,
        //   });
        //   if (!coupan) {
        //     throw "Coupon doesn't exist";
        //   } else {
        var today = new Date().toLocaleDateString();
        today = new Date(today);
        let result = await couponPolicyModel
            .findOne(
                {
                    couponCode: couponCode,
                    activeFrom: { $lte: today },
                    activeTo: { $gte: today },
                },
                { couponValue: 1, _id: 0, isPercentage: 1, orderPriceLimit: 1 }
            )
            .lean();
        // if (result) {
        // const data = new couponStatusModel({
        //   couponCode: couponCode,
        //   customer: mongoose.Types.ObjectId(customerId),
        //   isBuy: true,
        // });
        // await data.save();
        result.isCoupon = true;
        return result;
        // } else {
        //   throw "Coupon expire";
        // }
        // }
    },
    ValidCoupon: async (customerId, couponCode) => {
        let data = new couponStatusModel({
            couponCode: couponCode,
            customer: mongoose.Types.ObjectId(customerId),
        });
        await data.save();
        return data;
        // const consumeCoupon = await data.save();
        // return consumeCoupon;
    },
    consumeCoupon: async (customerId, couponCode) => {
        let data = await couponStatusModel.findOneAndUpdate(
            {
                couponCode: couponCode,
                customer: mongoose.Types.ObjectId(customerId)
            },
            {
                isBuy: true,
            },
            { upsert: true }
        );

        if (data) {
            await data.save();
        } else {
            console.error('Coupon not found or upsert failed');
        }
    }
    ,
    getOne: async (_id) => {
        var _id = mongoose.Types.ObjectId(_id);
        const result = await couponPolicyModel.findById({ _id });
        return result;
    },

    addNew: async (
        couponCode,
        image,
        expireDate,
        orderPriceLimit,
        couponValue,
        isActive,
        isPercentage
    ) => {
        image = await uploadFile(image);
        var data = new couponPolicyModel({
            couponCode,
            image,
            expireDate,
            orderPriceLimit,
            couponValue,
            isActive,
            isPercentage,
        });
        const result = await data.save();
        if (result) {
            let subject = sendEmailNotificationInfo.coupon.title;
            let text = sendEmailNotificationInfo.coupon.body;
            await sendNotificationEmail(subject, text);
            expireDate = result.expireDate.toLocaleString();
            couponCode = result.coupanCode;
            couponValue = result.coupanValue;
            image = result.image;
            title = notificationInfo.coupon.title;
            body = notificationInfo.coupon.body;
            var message = `This Coupon  ${couponCode} has spacial discount of ${couponValue}.This offer for limited time end on ${expireDate}`;
            var topic = "Spacial discount Offer";
            var notificationType = "coupon";
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
        couponCode,
        image,
        expireDate,
        orderPriceLimit,
        couponValue,
        isActive,
        isPercentage
    ) => {
        if (image) {
            image = await uploadFile(image);
            var result = await couponPolicyModel.findOneAndUpdate(
                { _id },
                {
                    couponCode,
                    image,
                    expireDate,
                    orderPriceLimit,
                    couponValue,
                    isActive,
                    isPercentage,
                },
                {
                    upsert: true,
                }
            );
        } else {
            result = await couponPolicyModel.findOneAndUpdate(
                { _id },
                {
                    couponCode,
                    expireDate,
                    orderPriceLimit,
                    couponValue,
                    isActive,
                    isPercentage,
                },
                {
                    upsert: true,
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
    refundCoupon: async (customerId, couponCode) => {
        const now = new Date(new Date().toLocaleDateString());
        let coupon = await couponPolicyModel.findOne({
            couponCode: couponCode,
            expireDate: { $gte: now },
        });
        if (coupon) {
            const status = await couponStatusModel.deleteOne({
                couponCode: couponCode,
                customer: customerId,
            });
            console.log(status);
            if (status) {
                let customer = await customerModel.findById({ _id: customerId });
                await sendNotificationEmail(
                    "Coupon Refunded",
                    `Your order ${coupon.orderId} has been canceled and coupon ${couponCode} can be reused.`,
                    customer.email
                );
            }
        }
        return;
    },
};

module.exports = coupanPolicyServices;
