const express = require("express");
const expressAsyncHandler = require("express-async-handler");
const var_dump = require("var_dump");
const productsModel = require("../model/productsModel");
const productsServices = require("../services/productsServices");
const promotionModel = require("../model/promotionModel");
const productsRouter = express.Router();

productsRouter.get(
  "/all",
  expressAsyncHandler(async (req, res) => {
    // const limit = 5;
    // var { pageNumber } = req.query;
    const result = await productsServices.getproducts();
    res.status(200).send({
      msg: "products",
      data: result,
    });
  })
);
productsRouter.patch(
  "/quantityUpdate",
  expressAsyncHandler(async (req, res) => {
    const { productId, sku, actualPrice, discountedPrice, quantity } = req.body;
    const result = await productsServices.quantityUpdate(
      productId,
      sku,
      actualPrice,
      discountedPrice,
      quantity
    );
    if (result) {
      return res
        .status(200)
        .send({ msg: "product quantity updated.", data: result });
    } else {
      return res.status(400).send({ msg: "product quantity not updated" });
    }
  })
);
productsRouter.get(
  "/details?",
  expressAsyncHandler(async (req, res) => {
    const { productId } = req.query;
    const result = await productsServices.getProductsById(productId);
    if (result) {
      return res.status(200).send({
        msg: "Products",
        data: result,
      });
    } else {
      return res.status(400).send({ msg: "Products Not Found" });
    }
  })
);
productsRouter.get(
  "/detailsWeb?",
  expressAsyncHandler(async (req, res) => {
    const { productId } = req.query;
    const result = await productsServices.getProductsByIdWeb(productId);
    console.log("result", result);
    if (result) {
      return res.status(200).send({
        msg: "Products",
        data: result,
      });
    } else {
      return res.status(400).send({ msg: "Products Not Found" });
    }
  })
);
productsRouter.post(
  "/productDetails",
  expressAsyncHandler(async (req, res) => {
    const { productId, sku, quantity } = req.body;
    try {
      const result = await productsServices.getProductsDetails(
        productId,
        sku,
        quantity
      );
      if (result) {
        res.status(200).send({
          msg: "Products",
          data: result,
        });
      } else {
        res.status(200).send({
          msg: "Products",
          data: false,
        });
      }
    } catch (e) {
      return res.status(400).send({ msg: e.message });
    }
  })
);

productsRouter.post(
  "/",
  expressAsyncHandler(async (req, res) => {
    var {
      categoryId,
      subcategoryId,
      name,
      title,
      description,
      longDescription,
      isDiscount,
      isDeal,
      dealExpire,
      oneTimeDeal,
      discount,
      variant,
      images,
      vendor,
      isTaxable,
      taxHead,
      taxType,
      isPercentage,
      taxAmount,
      metaData,
      metaDescription,
      tags,
      addons,
      isFeatured,
    } = req.body;
    console.log(categoryId, subcategoryId);
    if (isDeal === true && (!dealExpire || !discount)) {
      return res.status(400).send({
        msg: "Fields Missing",
      });
    }
    const result = await productsServices.add(
      categoryId,
      subcategoryId,
      name,
      title,
      description,
      longDescription,
      isDiscount,
      isDeal,
      dealExpire,
      oneTimeDeal,
      discount,
      variant,
      images,
      vendor,
      isTaxable,
      taxHead,
      taxType,
      isPercentage,
      taxAmount,
      metaData,
      metaDescription,
      tags,
      addons,
      isFeatured
    );
    if (result) {
      return res.status(200).send({ msg: "product added.", data: result });
    } else {
      return res.status(400).send({ msg: "product not added" });
    }
  })
);

productsRouter.patch(
  "/",
  expressAsyncHandler(async (req, res) => {
    let {
      productId,
      categoryId,
      subcategoryId,
      name,
      title,
      description,
      longDescription,
      isDiscount,
      isDeal,
      dealExpire,
      oneTimeDeal,
      discount,
      variant,
      thumbnail,
      images,
      vendor,
      isTaxable,
      taxHead,
      taxType,
      isPercentage,
      taxAmount,
      metaData,
      metaDescription,
      tags,
      addons,
      newImages,
      isFeatured,
    } = req.body;
    let checkProduct = await productsModel.findById(
      { _id: productId },
      { isDeal: 1, isDiscount: 1 }
    );
    let checkProductPromotion = await promotionModel.findOne({
      product: { $in: productId },
    });
    if (
      (checkProduct.isDiscount === true && isDeal === true) ||
      (checkProduct.isDeal === true && isDiscount === true) ||
      checkProductPromotion
    ) {
      return res.status(400).send({ msg: "product already discounted" });
    }
    if (isDeal === true && (!dealExpire || !discount)) {
      return res.status(400).send({
        msg: "Fields Missing",
      });
    }
    const result = await productsServices.update(
      productId,
      categoryId,
      subcategoryId,
      name,
      title,
      description,
      longDescription,
      isDiscount,
      isDeal,
      dealExpire,
      oneTimeDeal,
      discount,
      variant,
      thumbnail,
      images,
      vendor,
      isTaxable,
      taxHead,
      taxType,
      isPercentage,
      taxAmount,
      metaData,
      metaDescription,
      tags,
      addons,
      newImages,
      isFeatured
    );
    if (result) {
      return res.status(200).send({ msg: "product Updated", data: result });
    } else {
      return res.status(400).send({ msg: "product not Updated" });
    }
  })
);
productsRouter.delete(
  "/",
  expressAsyncHandler(async (req, res) => {
    const { productId } = req.body;
    const result = await productsServices.delete(productId);
    if (result) {
      return res.status(200).send({ msg: "product deleted.", data: result });
    } else {
      return res.status(400).send({ msg: "product not deleted" });
    }
  })
);

module.exports = productsRouter;
