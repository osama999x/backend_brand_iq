const promotionModel = require("../model/promotionModel");
const projection = require("../config/mongoProjection");
const uploadFile = require("../utils/uploadFile");
const mongoose = require("mongoose");
const productModel = require("../model/productsModel");
const categoryModel = require("../model/categoryModel");
const subcategoryModel = require("../model/subCategoryModel");
// const productsImagesModel = require("../model/productsImagesModel");

const inventryStatusServices = {
  get: async () => {
    var products = await productModel.aggregate([
      {
        $lookup: {
          from: "categories",
          localField: "category",
          foreignField: "_id",
          as: "category",
        },
      },
      {
        $unwind: {
          path: "$category",
        },
      },
      {
        $lookup: {
          from: "subcategories",
          localField: "subcategory",
          foreignField: "_id",
          as: "subcategory",
        },
      },
      {
        $unwind: {
          path: "$subcategory",
        },
      },
      {
        $project: {
          _id: 0,
          productsId: "$_id",
          productsName: "$name",
          categoryName: "$category.name",
          subcategoryName: "$subcategory.name",
          remainingQuantity: {
            $sum: {
              $map: {
                input: "$variant",
                as: "variant",
                in: "$$variant.quantity",
              },
            },
          },
        },
      },
    ]);
    //   .find(
    //     {},
    //     {
    //       _id: 1,
    //       name: 1,
    //       "variant.quantity": 1,
    //     }
    //   )
    //   .populate({
    //     path: "category",
    //     select: { _id: true, name: true },
    //   })
    //   .populate({
    //     path: "subcategory",
    //     select: { _id: true, name: true },
    //   })
    //   .lean();
    // if (products.length != 0) {
    //   products = products.map((item) => {
    //     item.productsId = item._id;
    //     item.productsName = item.name;
    //     item.categoryName = item.category.name;
    //     item.subcategoryName = item.subcategory.name;
    //     var totalQuantity = 0;
    //     for (var i of item.variant) {
    //       totalQuantity += i.quantity;
    //     }
    //     if (totalQuantity <= 0) {
    //       totalQuantity = "Not in Stock";
    //     }
    //     item.remainingQuantity = totalQuantity;
    //     delete item._id;
    //     delete item.name;
    //     delete item.category;
    //     delete item.subcategory;
    //     delete item.variant;
    //     return item;
    //   });
    // }
    return products;
  },
};

module.exports = inventryStatusServices;
