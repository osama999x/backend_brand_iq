const express = require("express");
const expressAsyncHandler = require("express-async-handler");
const productsModel = require("../model/productsModel");
const subcategoryModel = require("../model/subCategoryModel");
const categoryServices = require("../services/categoryServices");
const productsServices = require("../services/productsServices");
const subCategoryServices = require("../services/subCategoryServices");
const categoryRouter = express.Router();

const GENDER_VALUES = ["men", "women", "juniors", "unisex"];

categoryRouter.get(
    "/all",
    expressAsyncHandler(async (req, res) => {
        const { gender } = req.query;
        if (gender && !GENDER_VALUES.includes(gender)) {
            return res.status(400).json({ msg: `gender must be one of: ${GENDER_VALUES.join(", ")}` });
        }
        const result = await categoryServices.get(gender);
        res.status(200).send({ msg: "Categories.", data: result });
    })
);

categoryRouter.get(
    "/products",
    expressAsyncHandler(async (req, res) => {
        const { categoryId } = req.query;
        const result = await categoryServices.getProducts(categoryId);
        if (result) {
            res.status(200).send({ msg: "Products by Category.", data: result });
        } else {
            res.status(400).send({ msg: "Not Found." });
        }
    })
);
//web
categoryRouter.get(
    "/subcategories",
    expressAsyncHandler(async (req, res) => {
        const { categoryId, page, pageSize } = req.query;
        const result = await categoryServices.getSubcategoriesAndProductsByCategoryId(
            categoryId, page, pageSize
        );
        if (result.length !== 0) {
            res
                .status(200)
                .send({ msg: "Subcategories by Categories.", data: result });
        } else {
            res.status(400).send({ msg: "Not Found." });
        }
    })
);
//portal
categoryRouter.get(
    "/subcatgeoriesportal",
    expressAsyncHandler(async (req, res) => {
        const { categoryId } = req.query;
        const categories = await categoryServices.getSubcategories(categoryId);
        if (categories.length !== 0) {
            res
                .status(200)
                .send({ msg: "Subcategories by Categories.", data: categories });
        } else {
            res.status(400).send({ msg: "Not Found." });
        }
    })
)
categoryRouter.get(
    "/getOne",
    expressAsyncHandler(async (req, res) => {
        const { categoryId } = req.query;
        const result = await categoryServices.getOne(categoryId);
        if (result) {
            res.status(200).send({ msg: " Category.", data: result });
        } else {
            res.status(400).send({ msg: "Not Found." });
        }
    })
);

categoryRouter.post(
    "/",
    expressAsyncHandler(async (req, res) => {
        const { name, icon, thumbnail, description, isFeatured, gender } = req.body;
        if (!name || !icon || !thumbnail) {
            return res.status(400).send({ msg: "Fields Missing." });
        }
        if (gender && !GENDER_VALUES.includes(gender)) {
            return res.status(400).json({ msg: `gender must be one of: ${GENDER_VALUES.join(", ")}` });
        }
        const result = await categoryServices.add(
            name,
            icon,
            thumbnail,
            description,
            isFeatured,
            gender
        );
        if (result) {
            return res.status(200).send({ msg: "Category Added.", data: result });
        } else {
            return res.status(400).send({ msg: "Category Not Added." });
        }
    })
);

categoryRouter.patch(
    "/",
    expressAsyncHandler(async (req, res) => {
        const { categoryId, name, icon, description, thumbnail, isFeatured, isActive, gender } = req.body;
        if (gender && !GENDER_VALUES.includes(gender)) {
            return res.status(400).json({ msg: `gender must be one of: ${GENDER_VALUES.join(", ")}` });
        }
        const result = await categoryServices.update(
            categoryId,
            name,
            icon,
            description,
            thumbnail,
            isFeatured,
            isActive,
            gender
        );
        if (result) {
            return res.status(200).send({ msg: "Category Updated.", data: result });
        } else {
            return res.status(400).send({ msg: "Category not Updated." });
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
                .send({ msg: "This category linked with Subcategory or Product!" });
        }
        const result = await categoryServices.delete(categoryId);
        if (result.deletedCount == 0) {
            return res.status(400).send({ msg: "ID Not Found." });
        }
        if (result) {
            return res.status(200).send({ msg: "Category Deleted.", data: result });
        } else {
            return res.status(400).send({ msg: "Category Not Deleted." });
        }
    })
);

module.exports = categoryRouter;
