const express = require("express");
const expressAsyncHandler = require("express-async-handler");
const promotionServices = require("../services/promotionServices");
const uploadFile = require("../utils/uploadFile");
const promotionRouter = express.Router();

promotionRouter.get(
  "/all",
  expressAsyncHandler(async (req, res) => {
    const result = await promotionServices.get();
    if (result.length !== 0) {
      return res.status(200).send({ msg: "promotions", data: result });
    } else {
      return res.status(400).send({ msg: "promotions Not Found" });
    }
  })
);
promotionRouter.get(
  "/promotionDetail",
  expressAsyncHandler(async (req, res) => {
    const { promotionId } = req.query;
    const result = await promotionServices.getPromotionDetail(promotionId);
    if (result.length !== 0) {
      return res.status(200).send({ msg: "promotions", data: result });
    } else {
      return res.status(400).send({ msg: "promotions Not Found" });
    }
  })
);

promotionRouter.post(
  "/",
  expressAsyncHandler(async (req, res) => {
    let {
      categoryId,
      subcategoryId,
      productId,
      campaignName,
      banner,
      discount,
      launchDate,
      endingDate,
    } = req.body;
    if (
      !categoryId ||
      !subcategoryId ||
      !productId ||
      !campaignName ||
      !discount
    ) {
      return res.status(400).send({ msg: "Fields Missing" });
    }
    banner = await uploadFile(banner);
    const result = await promotionServices.addNew(
      categoryId,
      subcategoryId,
      productId,
      campaignName,
      banner,
      discount,
      launchDate,
      endingDate
    );
    if (result) {
      return res.status(200).send({ msg: "Promotion added.", data: result });
    } else {
      return res.status(400).send({ msg: "Promotion not added" });
    }
  })
);

promotionRouter.patch(
  "/",
  expressAsyncHandler(async (req, res) => {
    let {
      promotionId,
      categoryId,
      subcategoryId,
      productId,
      campaignName,
      banner,
      discount,
      launchDate,
      endingDate,
      status,
    } = req.body;
    if (
      !categoryId ||
      !subcategoryId ||
      !productId ||
      !campaignName ||
      !discount
    ) {
      return res.status(400).send({ msg: "Fields Missing" });
    }
    banner = await uploadFile(banner);
    const result = await promotionServices.update(
      promotionId,
      categoryId,
      subcategoryId,
      productId,
      campaignName,
      banner,
      discount,
      launchDate,
      endingDate,
      status
    );
    if (result) {
      return res.status(200).send({ msg: "promotion updated.", data: result });
    } else {
      return res.status(400).send({ msg: "promotion not updated" });
    }
  })
);
promotionRouter.delete(
  "/",
  expressAsyncHandler(async (req, res) => {
    const { promotionId } = req.body;
    const result = await promotionServices.delete(promotionId);
    if (result.length == 0) {
      return res.status(400).send({ msg: "ID Not found" });
    }
    if (result) {
      return res.status(200).send({ msg: "promotion deleted.", data: result });
    } else {
      return res.status(400).send({ msg: "promotion not deleted" });
    }
  })
);

module.exports = promotionRouter;
