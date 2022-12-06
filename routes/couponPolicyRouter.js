const express = require("express");
const expressAsyncHandler = require("express-async-handler");
const couponPolicyServices = require("../services/couponPolicyServices");
const couponPolicyRouter = express.Router();

couponPolicyRouter.get(
  "/all",
  expressAsyncHandler(async (req, res) => {
    const result = await couponPolicyServices.get();
    if (result.length != 0) {
      return res.status(200).send({
        msg: "Coupon",
        data: result,
      });
    } else {
      return res.status(400).send({ msg: "Coupon Not Found" });
    }
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
    try {
      const result = await couponPolicyServices.getCustomerCoupan(
        couponCode,
        customerId
      );
      console.log(result);
      if (result) {
        res.status(200).send({
          msg: "Your Coupon",
          data: result,
        });
      } else {
        res.status(400).send({ msg: "Coupon Not Found", isCoupon: false });
      }
    } catch (e) {
      res.status(200).send({ msg: e, isCoupon: false });
    }
  })
);
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
      activeFrom,
      activeTo,
      couponValue,
      isActive,
      isPercentage,
    } = req.body;
    if (!couponCode || !activeFrom || !activeTo || !couponValue) {
      return res.status(400).send({ msg: "Fields Missing" });
    }
    const result = await couponPolicyServices.addNew(
      couponCode,
      image,
      activeFrom,
      activeTo,
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
      coupanCode,
      image,
      activeFrom,
      activeTo,
      isActive,
      isPercentage,
      couponValue,
    } = req.body;
    const result = await couponPolicyServices.update(
      couponId,
      coupanCode,
      image,
      activeFrom,
      activeTo,
      isActive,
      isPercentage,
      couponValue
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
