const express = require("express");
const expressAsyncHandler = require("express-async-handler");
const { date } = require("zod");
const courierServices = require("../services/courierServices");
const orderServices = require("../services/orderServices");
const warehouseModel = require("../model/warehouseModel");
const orderModel = require("../model/orderModel");
const courierRouter = express.Router();
courierRouter.get(
  "/postEx/operationalCities",
  expressAsyncHandler(async (req, res) => {
    const result = await courierServices.citiesList();
    if (result.statusCode === "200") {
      return res.status(200).send(result);
    } else {
      return res.status(400).send({
        msg: result.statusMessage,
      });
    }
  })
);
courierRouter.get(
  "/postEx/cancelOrder",
  expressAsyncHandler(async (req, res) => {
    const { parcelId } = req.query;
    const result = await courierServices.cancelOrder(parcelId);
    if (result.statusCode === "200") {
      return res.status(200).send(result);
    } else {
      return res.status(400).send({
        msg: result.statusMessage,
      });
    }
  })
);
courierRouter.get(
  "/postEx/orderTrack",
  expressAsyncHandler(async (req, res) => {
    const { parcelId } = req.query;
    const result = await courierServices.orderTrack(parcelId);
    if (result.statusCode === "200") {
      return res.status(200).send(result);
    } else {
      return res.status(400).send({
        msg: result.statusMessage,
      });
    }
  })
);
courierRouter.get(
  "/postEx/warehouse",
  expressAsyncHandler(async (req, res) => {
    const result = await courierServices.warehouse();
    if (result.statusCode === "200") {
      return res.status(200).send(result);
    } else {
      return res.status(400).send({
        msg: result.statusMessage,
      });
    }
  })
);
courierRouter.post(
  "/postEx/createOrder",
  expressAsyncHandler(async (req, res) => {
    const { orderId, originCityCode, orderType } = req.body;
    const order = await orderServices.customerOrder(orderId);
    if (!order) {
      return res.status(400).send({
        msg: "Order doesn't exist",
      });
    }
    // const pickupAddress = await warehouseModel.find({});
    // if (!pickupAddress) {
    //   return res.status(200).send({
    //     msg: "Pickup Address required",
    //   });
    // }
    const result = await courierServices.createOrder(
      order,
      originCityCode,
      orderType
    );
    if (result.statusCode === "200") {
      return res.status(200).send(result);
    } else {
      return res.status(400).send({
        msg: result.statusMessage,
      });
    }
  })
);
courierRouter.get(
  "/postEx/orderStatus",
  expressAsyncHandler(async (req, res) => {
    const result = await courierServices.orderStatus();
    if (result.statusCode === "200") {
      return res.status(200).send(result);
    } else {
      return res.json(result.statusMessage);
    }
  })
);
courierRouter.post(
  "/swyft/createOrder",
  expressAsyncHandler(async (req, res) => {
    const { orderId, originCityCode, description, packing, weight } = req.body;
    const order = await orderServices.customerOrder(orderId);
    if (!order) {
      return res.status(400).send({
        msg: "Order doesn't exist",
      });
    }
    const result = await courierServices.swyftCreateOrder(
      order,
      originCityCode,
      packing,
      description,
      weight
    );
    if (result.status === 200) {
      return res.status(200).send(result.data);
    } else {
      return res.json(result.data);
    }
  })
);
courierRouter.get(
  "/swyft/orderTrack",
  expressAsyncHandler(async (req, res) => {
    const { parcelId } = req.query;
    const result = await courierServices.swyftOrderTrack(parcelId);
    if (result.status === 200) {
      return res.status(200).send(result.data);
    } else {
      return res.json(result.data);
    }
  })
);

courierRouter.get(
  "/orderTrack",
  expressAsyncHandler(async (req, res) => {
    const { orderId } = req.query;
    const order = await orderModel.findOne({ _id: orderId, isDeliver: true });
    if (!order) {
      return res.status(400).send({ msg: "Order not delivered" });
    }
    let result = await courierServices.trackOrder(order);
    if (result.status === 200 || result.statusCode === "200") {
      result =
        order.courierType === "POSTEX"
          ? result.dist.transactionStatusHistory
          : result.data;
      return res
        .status(200)
        .send({ courierType: order.courierType, data: result });
    } else {
      return res.status(400).send({ msg: "Failed to order track" });
    }
  })
);
courierRouter.get(
  "/swyft/cancelOrder",
  expressAsyncHandler(async (req, res) => {
    const { parcelId } = req.query;
    const result = await courierServices.swyftCancelOrder(parcelId);
    console.log("result", result.data);
    if (result.status === 200) {
      return res.status(200).send(result.data);
    } else {
      return res.json(result.data);
    }
  })
);
courierRouter.get(
  "/swyft/OperationalCities",
  expressAsyncHandler(async (req, res) => {
    const result = await courierServices.swyftOperationalCities();
    if (result.status == 200) {
      res.status(200).send({
        msg: "Cities",
        data: result.data,
      });
    } else {
      return res.json(result.data);
    }
  })
);
module.exports = courierRouter;
