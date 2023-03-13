const { default: mongoose } = require("mongoose");
const moduleModel = require("../model/moduleModel");

const moduleServices = {
  create: async (label, route, isSubModule, permissions) => {
    const data = new moduleModel({
      label,
      route,
      isSubModule,
      permissions,
    });
    const result = await data.save();
    return result;
  },
  get: async () => {
    const modules = await moduleModel.aggregate([
      {
        $lookup: {
          from: "permissions",
          localField: "permissions",
          foreignField: "_id",
          as: "permissions",
        },
      },
      {
        $lookup: {
          from: "submodules",
          localField: "_id",
          foreignField: "module",
          as: "sub_modules",
        },
      },
      {
        $lookup: {
          from: "permissions",
          localField: "sub_modules.permissions",
          foreignField: "_id",
          as: "result",
        },
      },
      {
        $project: {
          _id: 1,
          label: 1,
          route: 1,
          isSubModule: 1,
          permissions: 1,
          sub_modules: {
            $map: {
              input: "$sub_modules",
              as: "submodule",
              in: {
                _id: "$$submodule._id",
                label: "$$submodule.label",
                route: "$$submodule.route",
                isSubModule: "$$submodule.isSubModule",
                permissions: "$result",
                result: "$$submodule.result",
              },
            },
          },
        },
      },
    ]);
    return modules;
  },
  getById: async (moduleId) => {
    const module = await moduleModel.aggregate([
      {
        $match: {
          _id: new mongoose.Types.ObjectId(moduleId),
        },
      },
      {
        $lookup: {
          from: "permissions",
          localField: "permissions",
          foreignField: "_id",
          as: "permissions",
        },
      },
      {
        $lookup: {
          from: "submodules",
          localField: "_id",
          foreignField: "module",
          as: "sub_modules",
        },
      },
      {
        $lookup: {
          from: "permissions",
          localField: "sub_modules.permissions",
          foreignField: "_id",
          as: "result",
        },
      },
      {
        $project: {
          _id: 1,
          label: 1,
          route: 1,
          isSubModule: 1,
          permissions: 1,
          sub_modules: {
            $map: {
              input: "$sub_modules",
              as: "submodule",
              in: {
                _id: "$$submodule._id",
                label: "$$submodule.label",
                route: "$$submodule.route",
                isSubModule: "$$submodule.isSubModule",
                permissions: "$result",
                result: "$$submodule.result",
              },
            },
          },
        },
      },
    ]);
    return module;
  },
};
module.exports = moduleServices;
