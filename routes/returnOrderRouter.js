const express = require("express");
const expressAsyncHandler = require("express-async-handler");
const exchangeOrderModel = require("../model/returnOrderModel");
const returnOrderServices = require("../services/returnOrderServices");
const orderModel = require("../model/orderModel");
const returnOrderRouter = express.Router();
returnOrderRouter.post(
  "/",
  expressAsyncHandler(async (req, res) => {
    const {
      orderId,
      isOrderReturn,
      shipmentType,
      returnProduct,
      exchangeReason,
      images,
    } = req.body;
    if (!orderId || !exchangeReason || !shipmentType) {
      return res.status(400).send({ msg: "Fields Missing" });
    }

    const delivered = await orderModel.findOne(
      {
        _id: orderId,
        status: { $eq: "Delivered" },
      },
      { placedOn: 1 }
    );
    if (delivered) {
      let date = new Date(new Date().toLocaleDateString());
      let placedOn30DaysPlus = new Date(delivered.placedOn);
      placedOn30DaysPlus = placedOn30DaysPlus.setDate(
        placedOn30DaysPlus.getDate() + 30
      );
      placedOn30DaysPlus = new Date(placedOn30DaysPlus);
      if (date > placedOn30DaysPlus) {
        return res
          .status(400)
          .send({ msg: "Order return request applicable under 30 days" });
      } else {
        const result = await returnOrderServices.exchangeOrder(
          orderId,
          isOrderReturn,
          shipmentType,
          returnProduct,
          exchangeReason,
          images
        );
        if (result) {
          return res.status(200).send({
            msg: "Order return request has been submitted",
            data: result,
          });
        } else {
          return res
            .status(400)
            .send({ msg: "Order return request not submitted" });
        }
      }
    } else {
      return res.status(400).send({
        msg: "Order return request applicable after delivered!",
      });
    }
  })
);
returnOrderRouter.get(
  "/list",
  expressAsyncHandler(async (req, res) => {
    const result = await returnOrderServices.returnOrderList();
    res.status(200).send({ msg: "Return Order ", data: result });
  })
);
returnOrderRouter.get(
  "/details",
  expressAsyncHandler(async (req, res) => {
    const { orderId } = req.query;
    const result = await returnOrderServices.returnOrderDetails(orderId);
    if (result) {
      return res.status(200).send({
        msg: "Order Details",
        data: result,
      });
    } else {
      return res.status(400).send({
        msg: "Order Not Found",
      });
    }
  })
);
returnOrderRouter.post(
  "/dispatchReturnOrder",
  expressAsyncHandler(async (req, res) => {
    const { status, orderId, message } = req.body;
    const result = await returnOrderServices.dispatchReturnOrder(
      status,
      orderId,
      message
    );
    if (result) {
      return res.status(200).send({
        msg: "Orders Status Successfully Updated",
      });
    } else {
      return res.status(400).send({ msg: "Order Not Dispatch" });
    }
  })
);
module.exports = returnOrderRouter;
