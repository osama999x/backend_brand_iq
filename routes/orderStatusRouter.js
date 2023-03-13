const express = require("express");
const expressAsyncHandler = require("express-async-handler");
const orderStatusServices = require("../services/orderStatusServices");
const orderStatusRouter = express.Router();

orderStatusRouter.get(
  "/all",
  expressAsyncHandler(async (req, res) => {
    const result = await orderStatusServices.get();
    res.status(200).send({ msg: "Order Status", data: result });
  })
);
orderStatusRouter.post(
  "/",
  expressAsyncHandler(async (req, res) => {
    const { orderStatusName } = req.body;
    if (!orderStatusName) {
      return res.status(400).send({ msg: "Fields Missing" });
    }
    const result = await orderStatusServices.addNew(orderStatusName);
    if (result) {
      return res.status(200).send({ msg: "Status added.", data: result });
    } else {
      return res.status(400).send({ msg: "Status not added" });
    }
  })
);
module.exports = orderStatusRouter;
