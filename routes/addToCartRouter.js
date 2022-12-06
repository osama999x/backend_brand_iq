const express = require("express");
const expressAsyncHandler = require("express-async-handler");
const { default: mongoose } = require("mongoose");
const addToCartServices = require("../services/addToCartServices");
const addToCartRouter = express.Router();

addToCartRouter.get(
  "/customer?",
  expressAsyncHandler(async (req, res) => {
    const { customerId } = req.query;
    const result = await addToCartServices.get(customerId);
    if (result.length != 0) {
      res.status(200).send({ msg: "List", data: result });
    } else {
      res.status(400).send({ msg: "Not Found" });
    }
  })
);
addToCartRouter.post(
  "/",
  expressAsyncHandler(async (req, res) => {
    const { customerId, products } = req.body;
    if (!customerId || !products) {
      return res.status(400).send({ msg: "Fields Missing" });
    }
    const result = await addToCartServices.addNewToCart(customerId, products);
    if (result) {
      return res.status(200).send({ msg: " added.", data: result });
    } else {
      return res.status(400).send({ msg: " not added" });
    }
  })
);

addToCartRouter.delete(
  "/",
  expressAsyncHandler(async (req, res) => {
    const { cartId } = req.body;
    const result = await addToCartServices.delete(cartId);
    if (result) {
      return res.status(200).send({ msg: " deleted.", data: result });
    } else {
      return res.status(400).send({ msg: " Not deleted" });
    }
  })
);

module.exports = addToCartRouter;
