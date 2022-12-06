const express = require("express");
const expressAsyncHandler = require("express-async-handler");
const var_dump = require("var_dump");
const productsModel = require("../model/productsModel");
const productsServices = require("../services/productsServices");
const productsRouter = express.Router();

productsRouter.get(
  "/all",
  expressAsyncHandler(async (req, res) => {
    // const limit = 5;
    // var { pageNumber } = req.query;
    const result = await productsServices.getproducts();
    if (result.length != 0) {
      return res.status(200).send({
        msg: "products",
        data: result,
      });
    } else {
      return res.status(400).send({ msg: "Products Not Found" });
    }
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
      return res.status(400).send({ msg: e });
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
      isColor,
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
      size,
      tags,
      addons,
    } = req.body;
    const result = await productsServices.add(
      categoryId,
      subcategoryId,
      name,
      title,
      description,
      longDescription,
      isColor,
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
      size,
      tags,
      addons
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
      isColor,
      variant,
      thumbnail,
      images,
      vendor,
      isTaxable,
      taxHead,
      taxType,
      isPercentage,
      taxAmount,
      isActive,
      isFeatured,
      isSale,
      isDeal,
      inStock,
      sequence,
      ratingNumber,
      ratingCount,
      metaData,
      metaDescription,
      size,
      tags,
      addons,
    } = req.body;
    const result = await productsServices.update(
      productId,
      categoryId,
      subcategoryId,
      name,
      title,
      description,
      longDescription,
      isColor,
      variant,
      thumbnail,
      images,
      vendor,
      isTaxable,
      taxHead,
      taxType,
      isPercentage,
      taxAmount,
      isActive,
      isFeatured,
      isSale,
      isDeal,
      inStock,
      sequence,
      ratingNumber,
      ratingCount,
      metaData,
      metaDescription,
      size,
      tags,
      addons
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
      return res.status(400).send({ msg: "ID Not found" });
    }
    if (result) {
      return res.status(200).send({ msg: "product deleted.", data: result });
    } else {
      return res.status(400).send({ msg: "product not deleted" });
    }
  })
);

module.exports = productsRouter;
