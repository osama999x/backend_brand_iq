const rolePermissionModel = require("../model/rolePermissionModel");
const mongoose = require("mongoose");
const projection = require("../config/mongoProjection");

const rolePermissionServices = {
  get: async () => {
    const result = await rolePermissionModel.find({}, projection.projection);
    return result;
  },
  getById: async (_id) => {
    const role_permission = await rolePermissionModel.findById({ _id });
    return role_permission;
  },
  addNew: async (role, history, modules, isSubmodule) => {
    const permission = new rolePermissionModel({
      role,
      history,
      modules,
      isSubmodule,
    });
    const result = await permission.save();
    return result;
  },
  getRolePermissions: async (roleId) => {
    const rolePermission = await rolePermissionModel.find({ role: roleId });
    return rolePermission;
  },
  getByRole: async (roleId) => {
    const roleDetails = await rolePermissionModel
      .findOne(
        { role: { $in: roleId } },
        {
          createdAt: 0,
          updatedAt: 0,
          __v: 0,
          "modules.isSubmodule": 0,
          "modules._id": 0,
          "modules.module._id": 0,
          "modules.permission._id": 0,
          "modules.sub_Modules._id": 0,
          "modules.sub_Modules.subModule._id": 0,
          "modules.sub_Modules.permission._id": 0,
        }
      )
      .populate({
        path: "role",
        select: {
          _id: 0,
          createdAt: 0,
          updatedAt: 0,
          __v: 0,
        },
      })
      .populate({
        path: "modules.module",
        select: {
          _id: 0,
          createdAt: 0,
          updatedAt: 0,
          __v: 0,
          permissions: 0,
        },
       // options:{sort:{orderPosition:1}}
      })
      .populate({
        path: "modules.permissions",
        select: {
          _id: 0,
          createdAt: 0,
          updatedAt: 0,
          __v: 0,
        },
      })
      .populate({
        path: "modules.sub_Modules.subModule",
        select: {
          _id: 0,
          createdAt: 0,
          updatedAt: 0,
          __v: 0,
          permissions: 0,
          isSubmodule: 0,
          module: 0,
        },
      })
      .populate({
        path: "modules.sub_Modules.permissions",
        select: {
          _id: 0,
          createdAt: 0,
          updatedAt: 0,
          __v: 0,
        },
      });
    return roleDetails;
  },
  getRolePermission: async (roleId) => {
    const roleDetails = await rolePermissionModel
      .findOne(
        { role: { $in: roleId } },
        {
          role: 0,
          history: 0,
          _id: 0,
          createdAt: 0,
          updatedAt: 0,
          __v: 0,
          "modules.isSubmodule": 0,
          "modules._id": 0,
          "modules.module._id": 0,
          "modules.permission._id": 0,
          "modules.sub_Modules._id": 0,
          "modules.sub_Modules.subModule._id": 0,
          "modules.sub_Modules.permission._id": 0,
        }
      )
      .populate({
        path: "modules.module",
        select: {
          _id: 0,
          createdAt: 0,
          updatedAt: 0,
          __v: 0,
          permissions: 0,
        },
      })
      .populate({
        path: "modules.permissions",
        select: {
          _id: 0,
          createdAt: 0,
          updatedAt: 0,
          __v: 0,
        },
      })
      .populate({
        path: "modules.sub_Modules.subModule",
        select: {
          _id: 0,
          createdAt: 0,
          updatedAt: 0,
          __v: 0,
          permissions: 0,
          isSubmodule: 0,
          module: 0,
        },
      })
      .populate({
        path: "modules.sub_Modules.permissions",
        select: {
          _id: 0,
          createdAt: 0,
          updatedAt: 0,
          __v: 0,
        },
      });
    return roleDetails;
  },
  update: async (_id, role, history, modules, isSubmodule) => {
    var _id = mongoose.Types.ObjectId(_id);
    const result = await rolePermissionModel.findOneAndUpdate(
      { _id },
      { role, history, modules, isSubmodule },
      { new: true }
    );
    return result;
  },
  assignNewPermission: async (
    _id,
    module,
    isSubmodule,
    subModule,
    permission,
  ) => {
    const result = await rolePermissionModel.findOneAndUpdate(
      { _id },
      {
        $addToSet: {
          "modules.module": module,
        },
        $push: {
          "modules.isSubmodule": isSubmodule,
          "modules.permissions": permission,
          "modules.sub_modules.subModule": subModule,
          "modules.sub_modules.permissions": permission
        },
      },
      { new: true }
    );
    return result;
  },
  delete: async (_id) => {
    //const filter = { _id: _id };
    var _id = mongoose.Types.ObjectId(_id);
    const result = await rolePermissionModel.deleteOne({ _id });
    return result;
  },
};

module.exports = rolePermissionServices;
