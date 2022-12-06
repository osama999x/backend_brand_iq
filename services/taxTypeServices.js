const projection = require("../config/mongoProjection");
const mongoose = require("mongoose");
const taxTypeModel = require("../model/taxTypeModel");

const taxTypeServices = {
  get: async () => {
    const list = await taxTypeModel.find({}, projection.projection);
    return list;
  },
  getOne: async (_id) => {
    const resutl = await taxTypeModel.findById({ _id }, projection.projection);
    return resutl;
  },
  add: async (taxType) => {
    const data = new taxTypeModel({ taxType });
    const result = await data.save();
    return result;
  },

  update: async (_id, taxType) => {
    var _id = mongoose.Types.ObjectId(_id);
    const result = await taxTypeModel.findOneAndUpdate(
      { _id },
      { taxType },
      { new: true }
    );
    return result;
  },
  delete: async (_id) => {
    var _id = mongoose.Types.ObjectId(_id);
    const result = await taxTypeModel.deleteOne({ _id });
    return result;
  },
};

module.exports = taxTypeServices;
