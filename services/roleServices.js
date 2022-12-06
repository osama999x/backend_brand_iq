const roleModel = require("../model/roleModel");
const mongoose = require("mongoose");
const projection = require("../config/mongoProjection");

const roleServices = {
  get: async () => {
    const result = await roleModel
      .find({ name: { $nin: "Super_Admin" } }, projection.projection)
      .populate({
        path: "permissions",
        select: { _id: 1, name: 1 },
      });
    return result;
  },
  getRoleByID: async (_id) => {
    var _id = mongoose.Types.ObjectId(_id);
    const result = await roleModel
      .findById({ _id }, projection.projection)
      .populate({
        path: "permissions",
        select: { _id: 1, name: 1 },
      });
    return result;
  },
  addNew: async (permissions, name, description) => {
    const role = new roleModel({
      permissions,
      name,
      description,
    });
    const result = await role.save();
    return result;
  },
  update: async (_id, permissions, name, description) => {
    var _id = mongoose.Types.ObjectId(_id);
    const result = await roleModel.findOneAndUpdate(
      { _id },
      { permissions, name, description },
      { new: true }
    );
    return result;
  },
  delete: async (_id) => {
    //const filter = { _id: _id };
    var _id = mongoose.Types.ObjectId(_id);
    const result = await roleModel.deleteOne({ _id });
    return result;
  },
};

module.exports = roleServices;
