const express = require("express");
const expressAsyncHandler = require("express-async-handler");
const productsModel = require("../model/productsModel");
const productsServices = require("../services/productsServices");
const subCategoryServices = require("../services/subCategoryServices");
const subCategoryRouter = express.Router();

subCategoryRouter.get(
  "/all",
  expressAsyncHandler(async (req, res) => {
    const result = await subCategoryServices.getsubcategories();
    if (result.length !== 0) {
      return res.status(200).send({ msg: "subcategories", data: result });
    } else {
      return res.status(400).send({ msg: "subcategories Not Found" });
    }
  })
);
subCategoryRouter.get(
  "/products",
  expressAsyncHandler(async (req, res) => {
    const { subCategoryId } = req.query;
    const result = await subCategoryServices.getProductsBySubCategory(
      subCategoryId
    );
    if (result) {
      res.status(200).send({ msg: "products by subcategory", data: result });
    } else {
      res.status(400).send({ msg: "Not found" });
    }
  })
);
subCategoryRouter.get(
  "/productsBySubcategory",
  expressAsyncHandler(async (req, res) => {
    const { subCategoryId } = req.query;
    const result = await subCategoryServices.ProductsBySubCategory(
      subCategoryId
    );
    if (result) {
      res.status(200).send({ msg: "products by subcategory", data: result });
    } else {
      res.status(400).send({ msg: "Not found" });
    }
  })
);
subCategoryRouter.get(
  "/getSubcategoryByCategoryId",
  expressAsyncHandler(async (req, res) => {
    const { categoryId } = req.query;
    const result = await subCategoryServices.getSubcategoryByCategoryId(
      categoryId
    );
    if (result) {
      res.status(200).send({ msg: "Category by Subcategory", data: result });
    } else {
      res.status(400).send({ msg: "Not found" });
    }
  })
);
subCategoryRouter.get(
  "/getOne",
  expressAsyncHandler(async (req, res) => {
    const { subcategoryId } = req.query;
    const result = await subCategoryServices.getOne(subcategoryId);
    if (result) {
      res.status(200).send({ msg: " Category", data: result });
    } else {
      res.status(400).send({ msg: "Not found" });
    }
  })
);

subCategoryRouter.post(
  "/",
  expressAsyncHandler(async (req, res) => {
    const { categoryId, name, icon, thumbnail, description, isFeatured } =
      req.body;
    if (!categoryId || !name || !icon || !description || !thumbnail) {
      return res.status(400).send({ msg: "Fields Missing" });
    }
    const result = await subCategoryServices.add(
      categoryId,
      name,
      icon,
      thumbnail,
      description,
      isFeatured
    );
    if (result) {
      return res.status(200).send({ msg: "subCategory added.", data: result });
    } else {
      return res.status(400).send({ msg: "subCategory not added" });
    }
  })
);

subCategoryRouter.patch(
  "/",
  expressAsyncHandler(async (req, res) => {
    const { subcategoryId, categoryId, name, icon, description, isFeatured } =
      req.body;
    // if (!subcategoryId || !name || !icon || !description || !categoryId) {
    //   return res.status(400).send({ msg: "Fields Missing" });
    // }
    const result = await subCategoryServices.update(
      subcategoryId,
      categoryId,
      name,
      icon,
      description,
      isFeatured
    );
    if (result) {
      return res
        .status(200)
        .send({ msg: "subCategory updated.", data: result });
    } else {
      return res.status(400).send({ msg: "subCategory not updated" });
    }
  })
);
subCategoryRouter.delete(
  "/",
  expressAsyncHandler(async (req, res) => {
    const { subcategoryId } = req.body;
    const checkSubcategory = await productsServices.productsubCategory(
      subcategoryId
    );
    console.log("subcategory", checkSubcategory);
    if (checkSubcategory.length != 0) {
      return res
        .status(400)
        .send({ msg: "This subcategory linked with product!" });
    }
    console.log("subcate", subcategoryId);
    const result = await subCategoryServices.delete(subcategoryId);
    if (result.deletedCount === 0) {
      return res.status(400).send({ msg: "ID Not found" });
    }
    if (result) {
      return res
        .status(200)
        .send({ msg: "subCategory deleted.", data: result });
    } else {
      return res.status(400).send({ msg: "subCategory not deleted" });
    }
  })
);

module.exports = subCategoryRouter;
