const permissionActionModel = require("../model/permissionActionModel");

const permissionActionServices = {
  create: async (perm_name, route) => {
    const data = new permissionActionModel({ perm_name, route });
    const result = await data.save();
    return result;
  },
  get: async () => {
    const permissionAction = await permissionActionModel.find({});
    return permissionAction;
  },
};
module.exports = permissionActionServices;
