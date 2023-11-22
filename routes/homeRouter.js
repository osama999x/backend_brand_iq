const { text } = require("body-parser");
const { query } = require("express");
const express = require("express");
const expressAsyncHandler = require("express-async-handler");
const homeServices = require("../services/homeServices");
const homeRouter = express.Router();

homeRouter.get(
  "/all",
  expressAsyncHandler(async (req, res) => {
    // const { page, limit } = req.query;
    // eq.query);
    const result = await homeServices.get();
    res.status(200).send({ msg: "Home Screen", data: result });
  })
);

homeRouter.get(
  "/limitedProduct",
  expressAsyncHandler(async (req, res) => {
    // const { page, limit } = req.query;
    // eq.query);
    const result = await homeServices.getLimitedProduct();
    res.status(200).send({ msg: "Home Screen", data: result });
  })
);
homeRouter.get(
  "/recentProduct",
  expressAsyncHandler(async (req, res) => {
    // const { page, limit } = req.query;
    // eq.query);
    const result = await homeServices.getRecentProduct();
    res.status(200).send({ msg: "Home Screen Recent Products", data: result });
  })
);
homeRouter.get(
  "/bannerSearchProduct",
  expressAsyncHandler(async (req, res) => {
    const { type,price } = req.query;
    const result = await homeServices.bannerSearchProductByTags(type, price);
    res.status(200).send({ msg: "Search Products", data: result });
  })
);
homeRouter.get(
  "/searchProduct",
  expressAsyncHandler(async (req, res) => {
    const { text } = req.query;
    const result = await homeServices.searchProductByTags(text);
    res.status(200).send({ msg: "Search Products", data: result });
  })
);
homeRouter.get(
  "/getProductByTags",
  expressAsyncHandler(async (req, res) => {
    const { tags } = req.query;
    const result = await homeServices.getProductByTags(tags);
    res.status(200).send({ msg: "Products", data: result });
  })
);
homeRouter.get(
  "/getAllCategories",
  expressAsyncHandler(async (req, res) => {
    const result = await homeServices.getAllCategories();
    res.status(200).send({ msg: "Products", data: result });
  })
);

module.exports = homeRouter;
