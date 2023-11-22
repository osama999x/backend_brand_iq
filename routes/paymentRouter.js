const express = require("express");
const expressAsyncHandler = require("express-async-handler");
const orderModel = require("../model/orderModel");
const orderServices = require("../services/orderServices");
const paymentHistoryService = require("../services/paymentHistoryServices");
const { post } = require("./roleRouter");
const querystring = require("querystring");

const paymentRouter = express.Router();
paymentRouter.get(
  "/payfast/success?",
  expressAsyncHandler(async (req, res) => {
    if (process.env.NODE_ENV === "development") {
      const { err_code, transaction_amount } = req.query;
      console.log(req.query);
      if (err_code === "000") {
        const orderId = req.query.basket_id;
        const order = await orderModel.findOne({
          _id: orderId,
        });
        if (!order) {
          return;
        }
        await orderServices.orderPayment(orderId);
        const log = await paymentHistoryService.new(
          order.customer,
          order._id,
          "payfast",
          req.query,
          transaction_amount
        );
        console.log(log);
        res.status(200).send({ msg: "payment successfully" });
        return;
      } else {
        return res.status(400).send("Failed!");
      }
    }
  })
);
paymentRouter.get(
  "/payfast/website/success?",
  expressAsyncHandler(async (req, res) => {
    if (process.env.NODE_ENV === "development") {
      const { err_code, transaction_amount } = req.query;
      const queryString = querystring.stringify(req.query);
      console.log(queryString);
      if (err_code === "000") {
        const orderId = req.query.basket_id;
        const order = await orderModel.findOne({
          _id: orderId,
        });
        if (!order) {
          return;
        }
        await orderServices.orderPayment(orderId);
        const log = await paymentHistoryService.new(
          order.customer,
          order._id,
          "payfast",
          req.query,
          transaction_amount
        );
        res.redirect(`${req.query.app_url}/payment-success?${queryString}`);
        //res.status(200).send({ msg: "payment successfully" });

        return;
      } else {
        res.redirect(`${req.query.app_url}/payment-error`);
        //return res.status(400).send();
      }
    }
  })
);
paymentRouter.post(
  "/payfast/checkout?",
  expressAsyncHandler(async (req, res) => {
    const { err_code, transaction_amount } = req.body;
    console.log(req.body);
    try {
      if (err_code === "000") {
        const orderId = req.query.basket_id;
        const order = await orderServices.findOrder(orderId);
        if (!order) {
          return;
        }
        await orderServices.orderPayment(orderId);
        await paymentHistoryService.new(
          order.customer,
          order._id,
          "payfast",
          req.body,
          transaction_amount
        );
        res.sendStatus(200);
        return;
      } else {
        return res.status(400).send("Failed!");
      }
    } catch (e) {
      console.log(e);
    }
  })
);
paymentRouter.get(
  "/payfast/website/checkout?",
  expressAsyncHandler(async (req, res) => {
    const { err_code, transaction_amount } = req.query;
    const queryString = querystring.stringify(req.query);
    console.log(req.query);
    try {
      if (err_code === "000") {
        const orderId = req.query.basket_id;
        const order = await orderServices.findOrder(orderId);
        if (!order) {
          return;
        }
        await orderServices.orderPayment(orderId);
        await paymentHistoryService.new(
          order.customer,
          order._id,
          "payfast",
          req.body,
          transaction_amount
        );
        return res.redirect(
          `${req.query.app_url}/payment-success?${queryString}`
        );
        // res.sendStatus(200);
      } else {
        return res.redirect(`${req.query.app_url}/payment-error`);

        // return res.status(400).send("Failed!");
      }
    } catch (e) {
      console.log(e);
    }
  })
);
paymentRouter.get(
  "/payfast/failure?",
  expressAsyncHandler(async (req, res) => {
    res.send(req.query);
    console.log(req.query);
  })
);
paymentRouter.get(
  "/history",
  expressAsyncHandler(async (req, res) => {
    const { userId } = req.query;
    const result = await paymentHistoryService.history(userId);
    if (result) {
      return res.status(200).send({ msg: "Payment History", data: result });
    } else {
      return res
        .status(400)
        .send({ msg: "Payment History Not Found!", data: result });
    }
  })
);
module.exports = paymentRouter;
