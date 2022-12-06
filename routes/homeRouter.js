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
    if (result) {
      return res.status(200).send({ msg: "Home Screen", data: result });
    } else {
      return res.status(400).send({ msg: "Not Found" });
    }
  })
);

homeRouter.get(
  "/limitedProduct",
  expressAsyncHandler(async (req, res) => {
    // const { page, limit } = req.query;
    // eq.query);
    const result = await homeServices.getLimitedPorduct();
    if (result.length!=0) {
      return res.status(200).send({ msg: "Home Screen", data: result });
    } else {
      return res.status(400).send({ msg: "Not Found" });
    }
  })
);
homeRouter.get(
  "/recentProduct",
  expressAsyncHandler(async (req, res) => {
    // const { page, limit } = req.query;
    // eq.query);
    const result = await homeServices.getRecentPorduct();
    if (result.length != 0) {
      return res.status(200).send({ msg: "Home Screen Recent Products", data: result });
    } else {
      return res.status(400).send({ msg: "Not Found" });
    }
  })
);

module.exports = homeRouter;
