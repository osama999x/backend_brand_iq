const roleModel = require("../model/roleModel");
const mongoose = require("mongoose");
const projection = require("../config/mongoProjection");
const userModel = require("../model/userModel");

const roleServices = {
  get: async () => {
    const result = await roleModel.find({}, projection.projection);
    return result;
  },
  getRoleByID: async (_id) => {
    var _id = mongoose.Types.ObjectId(_id);
    const result = await roleModel.findById({ _id }, projection.projection);
    return result;
  },
  addNew: async (name, description) => {
    const role = new roleModel({
      name,
      description,
    });
    const result = await role.save();
    return result;
  },
  update: async (_id, name, description) => {
    var _id = mongoose.Types.ObjectId(_id);
    const result = await roleModel.findOneAndUpdate(
      { _id },
      { name, description },
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
  getUserRole: async (roleId) => {
    let role = await userModel.find({ role: roleId });
    return role;
  },
};

module.exports = roleServices;
