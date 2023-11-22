const categoryModel = require("../model/categoryModel");
const subCategoryModel = require("../model/subCategoryModel");
const productModel = require("../model/productsModel");
const projection = require("../config/mongoProjection");
const uploadFile = require("../utils/uploadFile");
const mongoose = require("mongoose");
const subcategoryModel = require("../model/subCategoryModel");

const categoryServices = {
  get: async () => {
    const list = await categoryModel
      .find({}, projection.projection)
      .sort({ createdAt: -1 });
    return list;
  },
  getOne: async (_id) => {
    const list = await categoryModel.findById({ _id }, projection.projection);
    return list;
  },
  getProducts: async (category) => {
    let today = new Date(new Date().toLocaleDateString());
    let list = await productModel.aggregate([
      {
        $match: { category: new mongoose.Types.ObjectId(category) },
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
          category: 1,
          subcategory: 1,
          name: 1,
          title: 1,
          description: 1,
          longDescription: 1,
          isColor: 1,
          thumbnail: 1,
          images: 1,
          isActive: 1,
          vendor: 1,
          isFeatured: 1,
          isSale: 1,
          isDeal: 1,
          discount: 1,
          isDiscount: 1,
          oneTimeDeal: 1,
          inStock: 1,
          sequence: 1,
          ratingCount: 1,
          ratingNumber: 1,
          isFavourite: 1,
          isTaxable: 1,
          taxHead: 1,
          taxType: 1,
          isPercentage: 1,
          taxAmount: 1,
          metaData: 1,
          metaDescription: 1,
          addons: 1,
          tags: 1,
          createdAt: 1,
          updatedAt: 1,
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
      {
        $lookup: {
          from: "categories",
          localField: "category",
          foreignField: "_id",
          let: { id: "$category" },
          pipeline: [
            { $match: { $expr: { $eq: ["$_id", "$$id"] } } },
            { $project: { _id: 1, name: 1 } },
          ],
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
          let: { id: "$subcategory" },
          pipeline: [
            { $match: { $expr: { $eq: ["$_id", "$$id"] } } },
            { $project: { _id: 1, name: 1 } },
          ],
          as: "subcategory",
        },
      },
      {
        $unwind: {
          path: "$subcategory",
        },
      },
    ]);
    if (list.length != 0) {
      list = list.map((item) => {
        images = item.images;
        if (item.isDeal === true) {
          discount = item.discount;
          for (let i of item.variant) {
            actualPrice = i.actualPrice;
            i.discountedPrice = actualPrice - discount;
            image = i.image;
            if (!images.includes(image)) {
              images.push(image);
            }
          }
        } else {
          for (var j of item.variant) {
            image = j.image;
            if (!images.includes(image)) {
              images.push(image);
            }
          }
        }
        return item;
      });
    }
    return list;
  },

  getSubCategoriesByCategoryId: async (categoryId) => {
    const subcategories = await subCategoryModel.find(
      { category: mongoose.Types.ObjectId(categoryId) },
      { _id: 1, name: 1, icon: 1, thumbnail: 1 }
    );
    const category = await categoryModel.findOne(
      { _id: mongoose.Types.ObjectId(categoryId) },
      { _id: 1, name: 1, icon: 1, description: 1, thumbnail: 1 }
    );
    dict = { category: category, subcategories: subcategories };
    return dict;
  },
  add: async (name, icon, thumbnail, description, isFeatured) => {
    icon = await uploadFile(icon);
    thumbnail = await uploadFile(thumbnail);
    if (!icon) {
      return null;
    }
    if (!thumbnail) {
      return null;
    }
    const category = new categoryModel({
      name,
      icon,
      thumbnail,
      description,
      isFeatured,
    });
    const result = await category.save();
    return result;
  },
  update: async (_id, name, icon, description, isFeatured) => {
    // if (!icon) {
    //   return null;
    // }
    // console.log(icon);
    // if (icon) {
    // }

    if (icon) {
      icon = await uploadFile(icon);
      var _id = mongoose.Types.ObjectId(_id);
      var result = await categoryModel.findOneAndUpdate(
        { _id },
        { name, icon, description, isFeatured },
        { new: true }
      );
    } else {
      var _id = mongoose.Types.ObjectId(_id);
      var result = await categoryModel.findOneAndUpdate(
        { _id },
        { name, description, isFeatured },
        { new: true }
      );
    }
    return result;
  },
  delete: async (_id) => {
    var _id = mongoose.Types.ObjectId(_id);
    const result = await categoryModel.deleteOne({ _id });
    return result;
  },
};

module.exports = categoryServices;
