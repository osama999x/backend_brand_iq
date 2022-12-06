const express = require("express");
const expressAsyncHandler = require("express-async-handler");
const categoryServices = require("../services/categoryServices");
const categoryRouter = express.Router();

categoryRouter.get(
  "/all",
  expressAsyncHandler(async (req, res) => {
    const result = await categoryServices.get();
    if (result.length !== 0) {
      res.status(200).send({ msg: "categories", data: result });
    } else {
      res.status(400).send({ msg: "No categories found" });
    }
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
    const { name, icon, description, isFeatured } = req.body;
    if (!name || !icon || !description) {
      return res.status(400).send({ msg: "Fields Missing" });
    }
    const result = await categoryServices.add(
      name,
      icon,
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
