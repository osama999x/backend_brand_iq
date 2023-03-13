const mongoose = require("mongoose");
const subModuleModel = require("../model/subModuleModel");

const subModuleServices = {
  create: async (label, route, module, permissions) => {
    const data = new subModuleModel({
      label,
      route,
      module,
      permissions,
    });
    const result = await data.save();
    return result;
  },
  get: async () => {
    const subModeule = await subModuleModel
      .find({}, { __v: 0, createdAt: 0, updatedAt: 0 })
      .populate({
        path: "permissions",
        select: { __v: 0, createdAt: 0, updatedAt: 0 },
      });
    return subModeule;
  },
  submoduleByModule: async (moduleId) => {
    const subModules = await subModuleModel
      .find(
        { module: { $in: moduleId } },
        { __v: 0, createdAt: 0, updatedAt: 0 }
      )
      .populate({
        path: "permissions",
        select: { __v: 0, createdAt: 0, updatedAt: 0 },
      });
    return subModules;
  },
};
module.exports = subModuleServices;
