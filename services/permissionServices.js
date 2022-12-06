const permissionModel = require("../model/permissionModel");
const mongoose = require("mongoose");
const projection = require("../config/mongoProjection");

const permissionServices = {
  get: async () => {
    const result = await permissionModel.find({}, projection.projection);
    return result;
  },
  addNew: async (name) => {
    const permission = new permissionModel({
      name,
    });
    const result = await permission.save();
    return result;
  },
  update: async (_id, name) => {
    var _id = mongoose.Types.ObjectId(_id);
    const result = await permissionModel.findOneAndUpdate(
      { _id },
      { name },
      { new: true }
    );
    return result;
  },
  delete: async (_id) => {
    //const filter = { _id: _id };
    var _id = mongoose.Types.ObjectId(_id);
    const result = await permissionModel.deleteOne({ _id });
    return result;
  },
};

module.exports = permissionServices;
