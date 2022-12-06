const express = require("express");
const expressAsyncHandler = require("express-async-handler");
const mPromotionServices = require("../services/mPromotionServices");
const uploadFile = require("../utils/uploadFile");
const mPromotionRouter = express.Router();

mPromotionRouter.get(
  "/all",
  expressAsyncHandler(async (req, res) => {
    const result = await mPromotionServices.get();
    if (result.length !== 0) {
      return res.status(200).send({ msg: "promotions", data: result });
    } else {
      return res.status(400).send({ msg: "promotions Not Found" });
    }
  })
);
mPromotionRouter.get(
  "/promotionProductDetail",
  expressAsyncHandler(async (req, res) => {
    const { promotionId } = req.query;
    const result = await mPromotionServices.getPromtionProductDetail(
      promotionId
    );
    if (result) {
      return res.status(200).send({ msg: "promotions", data: result });
    } else {
      return res.status(400).send({ msg: "promotions Not Found" });
    }
  })
);
mPromotionRouter.get(
  "/mPromotionDetail",
  expressAsyncHandler(async (req, res) => {
    const { promotionId } = req.query;
    const result = await mPromotionServices.getPromotionDetail(promotionId);
    if (result) {
      return res.status(200).send({ msg: "promotions", data: result });
    } else {
      return res.status(400).send({ msg: "promotions Not Found" });
    }
  })
);
mPromotionRouter.post(
  "/",
  expressAsyncHandler(async (req, res) => {
    let { campaignName, banner, promotion } = req.body;
    if (!campaignName || !promotion) {
      return res.status(400).send({ msg: "Fields Missing" });
    }
    banner = await uploadFile(banner);
    const result = await mPromotionServices.addNew(
      campaignName,
      banner,
      promotion
    );
    if (result) {
      return res.status(200).send({ msg: "Promotion added.", data: result });
    } else {
      return res.status(400).send({ msg: "Promotion not added" });
    }
  })
);

mPromotionRouter.patch(
  "/",
  expressAsyncHandler(async (req, res) => {
    let { promotionId, campaignName, banner, promotion } = req.body;
    if (!promotionId || !campaignName || !promotion) {
      return res.status(400).send({ msg: "Fields Missing" });
    }
    banner = await uploadFile(banner);
    const result = await mPromotionServices.update(
      promotionId,
      campaignName,
      banner,
      promotion
    );
    if (result) {
      return res.status(200).send({ msg: "promotion updated.", data: result });
    } else {
      return res.status(400).send({ msg: "promotion not updated" });
    }
  })
);
mPromotionRouter.delete(
  "/",
  expressAsyncHandler(async (req, res) => {
    const { promotionId } = req.query;
    const result = await mPromotionServices.delete(promotionId);
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
mPromotionRouter.get(
  "/mPromotionDetailById",
  expressAsyncHandler(async (req, res) => {
    const { promotionId } = req.query;
    const result = await mPromotionServices.promotionDetailById(promotionId);
    if (result) {
      return res.status(200).send({ msg: "promotions", data: result });
    } else {
      return res.status(400).send({ msg: "promotions Not Found" });
    }
  })
);
module.exports = mPromotionRouter;
