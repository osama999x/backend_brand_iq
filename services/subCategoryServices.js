const subCategoryModel = require("../model/subCategoryModel");
const productModel = require("../model/productsModel");
const projection = require("../config/mongoProjection");
const mongoose = require("mongoose");
const subcategoryModel = require("../model/subCategoryModel");
const uploadFile = require("../utils/uploadFile");
const categoryModel = require("../model/categoryModel");

const subCategoryServices = {
  getsubcategories: async () => {
    const result = subCategoryModel
      .find()
      .populate({
        path: "category",
        select: { _id: 1, name: 1 },
      })
      .sort({ createdAt: -1 });

    return result;
  },
  getOne: async (_id) => {
    const list = await subCategoryModel.findById(
      { _id },
      projection.projection
    );
    return list;
  },
  //sub

  getProductsBySubCategory: async (subcategoryId) => {
    let today = new Date(new Date().toLocaleDateString());
    console.log(today);
    let subcategory = await subCategoryModel
      .findById(
        { _id: subcategoryId },
        { _id: 1, name: 1, icon: 1, description: 1, thumbnail: 1 }
      )
      .lean();
    if (subcategory) {
      let products = await productModel.aggregate([
        {
          $match: { subcategory: new mongoose.Types.ObjectId(subcategoryId) },
        },
        {
          $lookup: {
            from: "promotions",
            localField: "_id",
            foreignField: "product",
            pipeline: [{ $match: { expireDate: { $gte: today } } }],
            as: "promotion",
          },
        },
        {
          $unwind: {
            path: "$promotion",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $project: {
            _id: 1,
            name: 1,
            title: 1,
            description: 1,
            thumbnail: 1,
            isDeal: 1,
            discount: 1,
            isDiscount: 1,
            variant: {
              $map: {
                input: "$variant",
                as: "variant",
                in: {
                  colorName: "$$variant.colorName",
                  colorHex: "$$variant.colorHex",
                  actualPrice: "$$variant.actualPrice",
                  quantity: "$$variant.quantity",
                  size: "$$variant.size",
                  image: "$$variant.image",
                  sku: "$$variant.sku",
                  _id: "$$variant._id",
                  discountedPrice: {
                    $ifNull: [
                      {
                        $subtract: [
                          "$$variant.actualPrice",
                          {
                            $multiply: [
                              "$promotion.discount",
                              {
                                $divide: ["$$variant.actualPrice", 100],
                              },
                            ],
                          },
                        ],
                      },
                      "$$variant.discountedPrice",
                    ],
                  },
                },
              },
            },
          },
        },
      ]);
      if (products.length != 0) {
        products = products.map((item) => {
          if (item.isDeal === true) {
            var price = item.variant[0].actualPrice - item.discount;
          } else if (item.isDiscount === true) {
            price = item.variant[0].discountedPrice;
          } else {
            price = item.variant[0].discountedPrice;
          }
          item.actualPrice = item.variant[0].actualPrice;
          item.price = price;
          delete item.variant;
          delete item.isDiscount;
          delete item.discount;
          delete item.isDeal;

          return item;
        });
      }
      subcategory.products = products;
    }
    return subcategory;
  },
  ProductsBySubCategory: async (subcategoryId) => {
    const subcateogry = await productModel.find(
      { subcategory: { $in: subcategoryId } },
      { _id: 1, name: 1 }
    );
    return subcateogry;
  },
  getSubcategoryByCategoryId: async (categoryId) => {
    const list = await subCategoryModel
      .find({ categoryId }, { _id: 1, name: 1 }, projection.projection)
      .populate({
        path: "category",
      });
    return list;
  },

  add: async (category, name, icon, thumbnail, description, isFeatured) => {
    console.log(icon);
    icon = await uploadFile(icon);
    thumbnail = await uploadFile(thumbnail);
    if (!icon) {
      return null;
    }
    if (!thumbnail) {
      return null;
    }
    let subcategory = new subCategoryModel({
      category: mongoose.Types.ObjectId(category),
      name,
      icon,
      thumbnail,
      description,
      isFeatured,
    });
    const result = await subcategory.save();
    return result;
  },
  update: async (
    subcategoryId,
    category,
    name,
    icon,
    description,
    isFeatured
  ) => {
    let result;
    if (icon) {
      icon = await uploadFile(icon);
      result = await subcategoryModel.findOneAndUpdate(
        { _id: subcategoryId },
        {
          category: mongoose.Types.ObjectId(category),
          name,
          icon,
          description,
          isFeatured,
        },
        { new: true }
      );
    } else {
      result = await subcategoryModel.findOneAndUpdate(
        { _id: subcategoryId },
        {
          category: mongoose.Types.ObjectId(category),
          name,
          description,
          isFeatured,
        },
        { new: true }
      );
    }
    return result;
  },
  delete: async (_id) => {
    var _id = mongoose.Types.ObjectId(_id);
    const result = await subcategoryModel.deleteOne({ _id });
    console.log("result", result);
    return result;
  },
  subcategory: async (category) => {
    console.log(category);
    const result = await subCategoryModel.find({
      category:category ,
    });
    return result;
  },
};

module.exports = subCategoryServices;
