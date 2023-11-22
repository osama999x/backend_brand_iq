const express = require("express");
const expressAsyncHandler = require("express-async-handler");
const couponPolicyServices = require("../services/couponPolicyServices");
const couponPolicyRouter = express.Router();

couponPolicyRouter.get(
  "/all",
  expressAsyncHandler(async (req, res) => {
    const result = await couponPolicyServices.get();
    res.status(200).send({
      msg: "Coupon",
      data: result,
    });
  })
);
couponPolicyRouter.get(
  "/validAll",
  expressAsyncHandler(async (req, res) => {
    const { customerId } = req.query;
    const result = await couponPolicyServices.getValidCoupan(customerId);
    if (result) {
      return res.status(200).send({
        msg: "Coupon",
        data: result,
      });
    } else {
      return res.status(400).send({ msg: "Coupon Not Found" });
    }
  })
);
couponPolicyRouter.post(
  "/customerCoupon",
  expressAsyncHandler(async (req, res) => {
    const { couponCode, customerId } = req.body;
    if (!couponCode || !customerId) {
      res.status(400).send({
        msg: "Fields Missing",
      });
    }
    const isCoupon = await couponPolicyServices.getOneCoupon(couponCode);
    if (!isCoupon) {
      res.status(400).send({ msg: "Coupon doesn't exist!", isCoupon: false });
      return;
    }
    const isUseCoupon = await couponPolicyServices.checkCustomerCoupon(
      couponCode,
      customerId
    );
    if (isUseCoupon) {
      res
        .status(400)
        .send({ msg: "You have already taken this coupon", isCoupon: false });
      return;
    }
    // try {
    const result = await couponPolicyServices.getCustomerCoupon(
      couponCode,
      customerId
    );
    console.log(result);
    if (result) {
      res.status(200).send({
        msg: "Your Coupon",
        data: result,
      });
      return;
    } else {
      res.status(400).send({ msg: "Coupon expire", isCoupon: false });
    }
    // } catch (e) {
    //   res.status(400).send({ msg: e, isCoupon: false });
    // }
  })
);
// couponPolicyRouter.post(
//   "/consumeCoupon",
//   expressAsyncHandler(async (req, res) => {
//     const { couponCode, customerId } = req.body;
//     if (!couponCode || !customerId) {
//       res.status(400).send({
//         msg: "Fields Missing",
//       });
//     }
//     const result = await couponPolicyServices.consumeCoupon(
//       couponCode,
//       customerId
//     );
//     if (result) {
//       res.status(200).send({
//         isCouponConsume: true,
//       });
//     } else {
//       res.status(200).send({
//         msg: "Coupon Not Consume",
//       });
//     }
//   })
// );
couponPolicyRouter.get(
  "/getOne",
  expressAsyncHandler(async (req, res) => {
    const { couponId } = req.query;
    const result = await couponPolicyServices.getOne(couponId);
    if (result) {
      return res.status(200).send({
        msg: "Coupon",
        data: result,
      });
    } else {
      return res.status(400).send({ msg: "Coupon Not Found" });
    }
  })
);
couponPolicyRouter.post(
  "/",
  expressAsyncHandler(async (req, res) => {
    const {
      couponCode,
      image,
      expireDate,
      orderPriceLimit,
      couponValue,
      isActive,
      isPercentage,
    } = req.body;
    if (!couponCode || !expireDate || !couponValue || !orderPriceLimit) {
      return res.status(400).send({ msg: "Fields Missing" });
    }
    const result = await couponPolicyServices.addNew(
      couponCode,
      image,
      expireDate,
      orderPriceLimit,
      couponValue,
      isActive,
      isPercentage
    );
    if (result) {
      return res.status(200).send({ msg: "Coupon added.", data: result });
    } else {
      return res.status(400).send({ msg: "Coupon not added" });
    }
  })
);

couponPolicyRouter.patch(
  "/",
  expressAsyncHandler(async (req, res) => {
    const {
      couponId,
      couponCode,
      image,
      expireDate,
      orderPriceLimit,
      couponValue,
      isActive,
      isPercentage,
    } = req.body;
    const result = await couponPolicyServices.update(
      couponId,
      couponCode,
      image,
      expireDate,
      orderPriceLimit,
      couponValue,
      isActive,
      isPercentage
    );
    if (result) {
      return res.status(200).send({ msg: "Coupon updated.", data: result });
    } else {
      return res.status(400).send({ msg: "Coupon not updated" });
    }
  })
);
couponPolicyRouter.delete(
  "/",
  expressAsyncHandler(async (req, res) => {
    const { couponId } = req.body;
    const result = await couponPolicyServices.delete(couponId);
    if (result.deletedCount == 0) {
      return res.status(400).send({ msg: "ID Not found" });
    }
    if (result) {
      return res.status(200).send({ msg: "Coupon deleted.", data: result });
    } else {
      return res.status(400).send({ msg: "Coupon not deleted" });
    }
  })
);

module.exports = couponPolicyRouter;
