const categoryModel = require("../model/categoryModel");
const subCategoryModel = require("../model/subCategoryModel");
const productModel = require("../model/productsModel");
const projection = require("../config/mongoProjection");
const uploadFile = require("../utils/uploadFile");
const mongoose = require("mongoose");
const subcategoryModel = require("../model/subCategoryModel");

const categoryServices = {
  get: async () => {
    const list = await categoryModel.find({}, projection.projection);
    return list;
  },
  getOne: async (_id) => {
    const list = await categoryModel.findById({ _id }, projection.projection);
    return list;
  },
  getProducts: async (category) => {
    const list = await productModel.find({ category }, projection.projection);
    return list;
  },

  getSubCategoriesByCategoryId: async (categoryId) => {
    const subcategories = await subCategoryModel.find(
      { category: mongoose.Types.ObjectId(categoryId) },
      { _id: 1, name: 1,icon:1 }
    );
    const category = await categoryModel.findOne(
      { _id: mongoose.Types.ObjectId(categoryId) },
      { _id: 1, name: 1, icon: 1, description: 1 }
    );
    dict = { category: category, subcategories: subcategories };
    return dict;
  },
  add: async (name, icon, description, isFeatured) => {
    icon = await uploadFile(icon);
    if (!icon) {
      return null;
    }
    const category = new categoryModel({
      name,
      icon,
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
    console.log(icon);
    if (icon) {
      icon = await uploadFile(icon);
    }

    if (icon) {
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
