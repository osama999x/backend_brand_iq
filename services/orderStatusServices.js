const orderStatusModel = require("../model/orderStatusModel");
const mongoose = require("mongoose");
const projection = require("../config/mongoProjection");

const orderStatusServices = {
  get: async () => {
    const result = await orderStatusModel.find(
      { orderStatusName: { $ne: "Returned" } },
      projection.projection
    );
    console.log(result);
    return result;
  },
  addNew: async (orderStatusName) => {
    const permission = new orderStatusModel({
      orderStatusName,
    });
    const result = await permission.save();
    return result;
  },
  orderStatus: async (statusName) => {
    const result = await orderStatusModel.findOne({
      orderStatusName: statusName,
    });
    return result;
  },
};
module.exports = orderStatusServices;
