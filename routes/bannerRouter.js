const express = require("express");
const expressAsyncHandler = require("express-async-handler");
const bannerServices = require("../services/bannerServices");
const bannerRouter = express.Router();
bannerRouter.get(
  "/all",
  expressAsyncHandler(async (req, res) => {
    const result = await bannerServices.get();
    res.status(200).send({
      msg: "Banner",
      data: result,
    });
  })
);
bannerRouter.post(
  "/",
  expressAsyncHandler(async (req, res) => {
    const { banner, type,isPercentage,price } = req.body;
    console.log(req.body.type)
     if (!banner || !type || (type === "underPrice" && !price)) {
       return res.status(400).send({
         msg: "Fields Missing",
       });
     }
    const result = await bannerServices.addNew(banner,isPercentage, type, price);
    if (result) {
     return res.status(200).send({
        msg: "Banner Added",
        data: result,
      });
    } else {
    return  res.status(400).send({
        msg: "Banner Not Added",
      });
    }
  })
);
bannerRouter.patch(
  "/",
  expressAsyncHandler(async (req, res) => {
    const { bannerId, banner,type,  isPercentage, price } = req.body;
    // if (type === "underPrice" && !price) {
    //   return res.status(400).send({
    //     msg: "Price is required for 'underPrice' type",
    //   });
    // }
    const result = await bannerServices.update(
      bannerId,
      banner,
      type,
      isPercentage,
      price
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
