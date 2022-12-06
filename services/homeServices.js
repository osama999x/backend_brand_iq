const projection = require("../config/mongoProjection");
const uploadFile = require("../utils/uploadFile");
const mongoose = require("mongoose");
const productModel = require("../model/productsModel");
const categoryModel = require("../model/categoryModel");
const subcategoryModel = require("../model/subCategoryModel");
const mPromotionModel = require("../model/mPromotionModel");
// const productsImagesModel = require("../model/productsImagesModel");

const homeServices = {
  get: async () => {
    try {
      const categories = await categoryModel.find(
        { isFeatured: true },
        projection.homecategoryprojection
      );
      // .skip((page - 1) * limit)
      // .limit(limit)
      // .sort("name");
      const subcategories = await subcategoryModel.find(
        { isFeatured: true },
        projection.homesubcategoryprojection
      );
      // .skip(page * limit)
      // .limit(limit)
      // .sort("name");
      let products = await productModel
        .find({ isFeatured: true }, projection.hometrendprojection)
        .lean();
      if (products.length != 0) {
        products = products.map((item) => {
          item.actualPrice = item.variant[0].actualPrice;
          item.discountedPrice = item.variant[0].discountedPrice;
          delete item.variant;
          return item;
        });
      }
      let currentDate = new Date().toLocaleDateString();
      currentDate = new Date(currentDate);
      var promotion = await mPromotionModel
        .find({ "promotion.status": { $in: "active" } }, projection.projection)
        .populate({
          path: "promotion.category",
          select: { _id: 1, name: 1 },
        })
        .populate({
          path: "promotion.subcategory",
          select: { _id: 1, name: 1 },
        })
        .populate({
          path: "promotion.product",
          select: {
            _id: 1,
            name: 1,
            title: 1,
            thumbnail: 1,
            description: 1,
            variant: 1,
          },
        })
        .lean();
      if (promotion.length != 0) {
        promotion = promotion.map((item) => {
          for (var i of item.promotion) {
            for (var j of i.product) {
              actualPrice = j.variant[0].actualPrice;
              j.actualPrice = actualPrice;
              j.discountedPrice = j.variant[0].discountedPrice;
              promotionalPrice = i.discount;
              j.promotionalPrice =
                actualPrice - (promotionalPrice / 100) * actualPrice;
              delete j.variant;
            }
          }
          return item;
        });
      }
      console.log(promotion);
      const result = {
        categories: categories,
        subcategories: subcategories,
        allProducts: products,
        promotionionalHeader: promotion,
      };
      return result;
    } catch (error) {
      throw new Error("Some data missing");
    }
  },
  getLimitedPorduct: async () => {
    const categories = await categoryModel
      .find({}, projection.homecategoryprojection)
      .limit(10);
    // .skip((page - 1) * limit)
    // .limit(limit)
    // .sort("name");
    const subcategories = await subcategoryModel
      .find({}, projection.homesubcategoryprojection)
      .limit(10);
    // .skip(page * limit)
    // .limit(limit)
    // .sort("name");
    let products = await productModel
      .find({}, projection.hometrendprojection)
      .limit(10)
      .lean();
    if (products.length != 0) {
      products = products.map((item) => {
        item.actualPrice = item.variant[0].actualPrice;
        delete item.variant;
        return item;
      });
    }
    // .skip(page * limit)
    // .limit(limit);
    const result = {
      categories: categories,
      subcategories: subcategories,
      products: products,
    };
    return result;
  },
  getRecentPorduct: async () => {
    let products = await productModel
      .find({}, projection.hometrendprojection)
      .limit(10)
      .sort({ $natural: -1 })
      .lean();
    if (products.length != 0) {
      products = products.map((item) => {
        item.actualPrice = item.variant[0].actualPrice;
        item.discountedPrice = item.variant[0].discountedPrice;
        delete item.variant;
        return item;
      });
    }
    return products;
  },
};

module.exports = homeServices;
