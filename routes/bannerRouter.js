const express = require("express");
const expressAsyncHandler = require("express-async-handler");
const bannerServices = require("../services/bannerServices");
const bannerRouter = express.Router();
bannerRouter.get(
  "/all",
  expressAsyncHandler(async (req, res) => {
    const result = await bannerServices.get();
    if (result.length != 0) {
      res.status(200).send({
        msg: "Banner",
        data: result,
      });
    } else {
      res.status(400).send({
        msg: "Banner Not Found",
      });
    }
  })
);
bannerRouter.post(
  "/",
  expressAsyncHandler(async (req, res) => {
    const { banner, screenRefrence } = req.body;
    const result = await bannerServices.addNew(banner, screenRefrence);
    if (!banner || !screenRefrence) {
      res.status(400).send({
        msg: "Fields Missing",
      });
    }
    if (result) {
      res.status(200).send({
        msg: "Banner Added",
        data: result,
      });
    } else {
      res.status(400).send({
        msg: "Banner Not Added",
      });
    }
  })
);
bannerRouter.patch(
  "/",
  expressAsyncHandler(async (req, res) => {
    const { bannerId, banner, screenRefrence } = req.body;
    const result = await bannerServices.update(
      bannerId,
      banner,
      screenRefrence
    );
    if (result) {
      res.status(200).send({
        msg: "Banner Updated",
        data: result,
      });
    } else {
      res.status(400).send({
        msg: "Banner Not Updated",
      });
    }
  })
);
bannerRouter.delete(
  "/",
  expressAsyncHandler(async (req, res) => {
    const { bannerId } = req.query;
    const result = await bannerServices.delete(bannerId);
    if (result) {
      res.status(200).send({
        msg: "Banner Deleted",
        data: result,
      });
    } else {
      res.status(400).send({
        msg: "Banner Not Deleted",
      });
    }
  })
);
module.exports = bannerRouter;
