const pointManageModel = require("../model/pointManageModel");
const mongoose = require("mongoose");
const projection = require("../config/mongoProjection");

const pointManageServices = {
  get: async () => {
    const result = await pointManageModel.find({}, projection.projection);
    return result;
  },
  getOne: async (_id) => {
    const result = await pointManageModel.findById(
      { _id },
      projection.projection
    );
    return result;
  },
  addNew: async (initialPoint, pointOrderPrice, pointPerOrder) => {
    const permission = new pointManageModel({
      initialPoint,
      pointOrderPrice,
      pointPerOrder,
    });
    const result = await permission.save();
    return result;
  },
  update: async (_id, initialPoint, pointOrderPrice, pointPerOrder) => {
    var _id = mongoose.Types.ObjectId(_id);
    const result = await pointManageModel.findOneAndUpdate(
      { _id },
      { initialPoint, pointOrderPrice, pointPerOrder },
      { new: true }
    );
    return result;
  },
  delete: async (_id) => {
    //const filter = { _id: _id };
    var _id = mongoose.Types.ObjectId(_id);
    const result = await pointManageModel.deleteOne({ _id });
    return result;
  },
};

module.exports = pointManageServices;
