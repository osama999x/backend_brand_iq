const express = require("express");
const expressAsyncHandler = require("express-async-handler");
const promotionCampaignServices = require("../services/promotionCampaignServices");
const uploadFile = require("../utils/uploadFile");
const promotionCampaignRouter = express.Router();
const productModel = require("../model/productsModel");

promotionCampaignRouter.get(
  "/all",
  expressAsyncHandler(async (req, res) => {
    const result = await promotionCampaignServices.get();
    res.status(200).send({ msg: "campaign", data: result });
  })
);
promotionCampaignRouter.get(
  "/web/all",
  expressAsyncHandler(async (req, res) => {
    const result = await promotionCampaignServices.getWeb();
    res.status(200).send({ msg: "campaign", data: result });
  })
);
promotionCampaignRouter.get(
  "/allPromotions",
  expressAsyncHandler(async (req, res) => {
    const result = await promotionCampaignServices.getPromotions();
    res.status(200).send({ msg: "promotions", data: result });
  })
);
promotionCampaignRouter.get(
  "/getOneCampaign",
  expressAsyncHandler(async (req, res) => {
    const { campaignId } = req.query;
    const result = await promotionCampaignServices.getOneCampaign(campaignId);
    if (result) {
      return res.status(200).send({ msg: "Campaign ", data: result });
    } else {
      return res.status(400).send({ msg: "campaign Not Found" });
    }
  })
);
promotionCampaignRouter.get(
  "/getOne",
  expressAsyncHandler(async (req, res) => {
    const { campaignId } = req.query;
    const result = await promotionCampaignServices.getOne(campaignId);
    if (result) {
      return res.status(200).send({ msg: "Campaign Promotions", data: result });
    } else {
      return res.status(400).send({ msg: "campaign Not Found" });
    }
  })
);
promotionCampaignRouter.get(
  "/getOnePromotion",
  expressAsyncHandler(async (req, res) => {
    const { promotionId } = req.query;
    const result = await promotionCampaignServices.getOnePromotion(promotionId);
    if (result) {
      return res.status(200).send({ msg: "promotion", data: result });
    } else {
      return res.status(400).send({ msg: "promotion Not Found" });
    }
  })
);
promotionCampaignRouter.get(
  "/promotionProductDetail",
  expressAsyncHandler(async (req, res) => {
    const { promotionId } = req.query;
    const result = await promotionCampaignServices.getPromtionProductDetail(
      promotionId
    );
    if (result) {
      return res.status(200).send({ msg: "promotions", data: result });
    } else {
      return res.status(400).send({ msg: "promotions Not Found" });
    }
  })
);
promotionCampaignRouter.post(
  "/",
  expressAsyncHandler(async (req, res) => {
    let { campaignName, description, banner, activeFrom, activeTo } = req.body;
    if (!campaignName || !banner || !description || !activeFrom || !activeTo) {
      return res.status(400).send({ msg: "Fields Missing" });
    }
    banner = await uploadFile(banner);
    const result = await promotionCampaignServices.addNew(
      campaignName,
      description,
      banner,
      activeFrom,
      activeTo
    );
    if (result) {
      return res
        .status(200)
        .send({ msg: "Promotion Campaign added.", data: result });
    } else {
      return res.status(400).send({ msg: "Promotion campaign not added" });
    }
  })
);
promotionCampaignRouter.post(
  "/addPromotion",
  expressAsyncHandler(async (req, res) => {
    let { campaignId, product, subcategory, expireDate, discount, status } =
      req.body;
    if (
      !campaignId ||
      product.length === 0 ||
      !subcategory ||
      !expireDate ||
      !discount ||
      !expireDate ||
      !status
    ) {
      return res.status(400).send({ msg: "Fields Missing" });
    }
    if (product.length != 0) {
      let checkProduct = await productModel.findOne({
        $and: [
          { _id: product },
          { $or: [{ isDeal: true }, { isDiscount: true }] },
        ],
      });
      if (checkProduct) {
        return res.status(400).send({ msg: "Product already discounted" });
      }
    }
    const result = await promotionCampaignServices.addPromotion(
      campaignId,
      product,
      subcategory,
      expireDate,
      discount,
      status
    );
    if (result) {
      return res.status(200).send({ msg: "Promotion  added.", data: result });
    } else {
      return res.status(400).send({ msg: "Promotion  not added" });
    }
  })
);
promotionCampaignRouter.patch(
  "/",
  expressAsyncHandler(async (req, res) => {
    let {
      campaignId,
      campaignName,
      description,
      banner,
      activeFrom,
      activeTo,
    } = req.body;
    // if (!promotionId || !campaignName || !promotion) {
    //   return res.status(400).send({ msg: "Fields Missing" });
    // }
    banner = await uploadFile(banner);
    const result = await promotionCampaignServices.update(
      campaignId,
      campaignName,
      description,
      banner,
      activeFrom,
      activeTo
    );
    if (result) {
      return res.status(200).send({ msg: "promotion updated.", data: result });
    } else {
      return res.status(400).send({ msg: "promotion not updated" });
    }
  })
);
promotionCampaignRouter.patch(
  "/updatePromotion",
  expressAsyncHandler(async (req, res) => {
    let { promotionId, product, subcategory, expireDate, discount, status } =
      req.body;
    if (product.length != 0) {
      let checkProduct = await productModel.find({
        _id: product,
        isDiscount: true,
        isDeal: true,
      });
      if (checkProduct.length != 0) {
        return res.status(400).send({ msg: "Product already discounted" });
      }
    }
    const result = await promotionCampaignServices.updatePromotion(
      promotionId,
      product,
      subcategory,
      expireDate,
      discount,
      status
    );
    if (result) {
      return res.status(200).send({ msg: "promotion updated.", data: result });
    } else {
      return res.status(400).send({ msg: "promotion not updated" });
    }
  })
);
promotionCampaignRouter.delete(
  "/",
  expressAsyncHandler(async (req, res) => {
    const { promotionId } = req.query;
    const result = await promotionCampaignServices.delete(promotionId);
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
promotionCampaignRouter.get(
  "/promotionDetailById",
  expressAsyncHandler(async (req, res) => {
    const { campaignId } = req.query;
    const result = await promotionCampaignServices.promotionDetailById(
      campaignId
    );
    if (result) {
      return res.status(200).send({ msg: "campaign promotions", data: result });
    } else {
      return res.status(400).send({ msg: "campaign promotions Not Found" });
    }
  })
);
promotionCampaignRouter.delete(
  "/deletePromotion",
  expressAsyncHandler(async (req, res) => {
    const { promotionId } = req.query;
    const result = await promotionCampaignServices.deletePromotion(promotionId);
    if (result.deletedCount == 0) {
      return res.status(400).send({ msg: "ID Not found" });
    }
    if (result) {
      return res.status(200).send({ msg: "promotion deleted", data: result });
    } else {
      return res.status(400).send({ msg: "promotion not deleted" });
    }
  })
);
module.exports = promotionCampaignRouter;
