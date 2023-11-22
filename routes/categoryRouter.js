const express = require("express");
const expressAsyncHandler = require("express-async-handler");
const productsModel = require("../model/productsModel");
const subcategoryModel = require("../model/subCategoryModel");
const categoryServices = require("../services/categoryServices");
const productsServices = require("../services/productsServices");
const subCategoryServices = require("../services/subCategoryServices");
const categoryRouter = express.Router();

categoryRouter.get(
  "/all",
  expressAsyncHandler(async (req, res) => {
    const result = await categoryServices.get();
    res.status(200).send({ msg: "categories", data: result });
  })
);

categoryRouter.get(
  "/products",
  expressAsyncHandler(async (req, res) => {
    const { categoryId } = req.query;
    const result = await categoryServices.getProducts(categoryId);
    if (result) {
      res.status(200).send({ msg: "products by category", data: result });
    } else {
      res.status(400).send({ msg: "Not found" });
    }
  })
);
categoryRouter.get(
  "/subcategories",
  expressAsyncHandler(async (req, res) => {
    const { categoryId } = req.query;
    const result = await categoryServices.getSubCategoriesByCategoryId(
      categoryId
    );
    if (result.length !== 0) {
      res
        .status(200)
        .send({ msg: "subcategories by categories", data: result });
    } else {
      res.status(400).send({ msg: "Not found" });
    }
  })
);
categoryRouter.get(
  "/getOne",
  expressAsyncHandler(async (req, res) => {
    const { categoryId } = req.query;
    const result = await categoryServices.getOne(categoryId);
    if (result) {
      res.status(200).send({ msg: " Category", data: result });
    } else {
      res.status(400).send({ msg: "Not found" });
    }
  })
);

categoryRouter.post(
  "/",
  expressAsyncHandler(async (req, res) => {
    const { name, icon, thumbnail, description, isFeatured } = req.body;
    if (!name || !icon || !description || !thumbnail) {
      return res.status(400).send({ msg: "Fields Missing" });
    }
    const result = await categoryServices.add(
      name,
      icon,
      thumbnail,
      description,
      isFeatured
    );
    if (result) {
      return res.status(200).send({ msg: "category added.", data: result });
    } else {
      return res.status(400).send({ msg: "category not added" });
    }
  })
);

categoryRouter.patch(
  "/",
  expressAsyncHandler(async (req, res) => {
    const { categoryId, name, icon, description, isFeatured } = req.body;
    const result = await categoryServices.update(
      categoryId,
      name,
      icon,
      description,
      isFeatured
    );
    if (result) {
      return res.status(200).send({ msg: "category updated.", data: result });
    } else {
      return res.status(400).send({ msg: "category not updated" });
    }
  })
);
categoryRouter.delete(
  "/",
  expressAsyncHandler(async (req, res) => {
    const { categoryId } = req.body;
    const category = await productsServices.productCategory(categoryId);
    const Subcategory = await subCategoryServices.subcategory(categoryId);
    if (category.length !== 0 || Subcategory.length !== 0) {
      return res
        .status(400)
        .send({ msg: "This category linked with subcategory or  product!" });
    }
    const result = await categoryServices.delete(categoryId);
    if (result.deletedCount == 0) {
      return res.status(400).send({ msg: "ID Not found" });
    }
    if (result) {
      return res.status(200).send({ msg: "category deleted.", data: result });
    } else {
      return res.status(400).send({ msg: "category not deleted" });
    }
  })
);

module.exports = categoryRouter;
