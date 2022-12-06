const subCategoryModel = require("../model/subCategoryModel");
const productModel = require("../model/productsModel");
const projection = require("../config/mongoProjection");
const mongoose = require("mongoose");
const subcategoryModel = require("../model/subCategoryModel");
const uploadFile = require("../utils/uploadFile");

const subCategoryServices = {
  getsubcategories: async () => {
    const result = subCategoryModel.find().populate({
      path: "category",
      select: { _id: 1, name: 1 },
    });

    return result;
  },
  getOne: async (_id) => {
    const list = await subCategoryModel.findById(
      { _id },
      projection.projection
    );
    return list;
  },
  getProductsBySubCategory: async (subcategoryId) => {
    var subcategory = await subCategoryModel.findOne(
      { _id: subcategoryId },
      { _id: 1, icon: 1, name: 1, description: 1 }
    );
    // .populate({
    //   path: "category",
    //   select: { _id: 1, name: 1 },
    // });
    //const price = 4000;
    let products = await productModel
      .find(
        { subcategory: { $in: subcategory } },
        { _id: 1, thumbnail: 1, title: 1, name: 1 }
      )
      .lean();
    products = products.map((item) => {
      item.price = 4000;
      return item;
    });
    dict = { subcategory: subcategory, products: products };
    return dict;
  },
  getSubcategoryByCategoryId: async (categoryId) => {
    const list = await subCategoryModel
      .find({ categoryId }, { _id: 1, name: 1 },projection.projection)
      .populate({
        path: "category",
      });
    return list;
  },

  add: async (category, name, icon, description, isFeatured) => {
    icon = await uploadFile(icon);
    if (!icon) {
      return null;
    }
    subcategory = new subCategoryModel({
      category: mongoose.Types.ObjectId(category),
      name,
      icon,
      description,
      isFeatured,
    });
    const result = await subcategory.save();
    return result;
  },
  update: async (_id, category, name, icon, description, isFeatured) => {
    var _id = mongoose.Types.ObjectId(_id);
    icon = await uploadFile(icon);
    if (!icon) {
      return null;
    }
    const result = await subcategoryModel.findOneAndUpdate(
      { _id },
      {
        category: mongoose.Types.ObjectId(category),
        name,
        icon,
        description,
        isFeatured,
      },
      { new: true }
    );
    return result;
  },
  delete: async (_id) => {
    var _id = mongoose.Types.ObjectId(_id);
    const result = await subcategoryModel.deleteOne({ _id });
    return result;
  },
};

module.exports = subCategoryServices;
