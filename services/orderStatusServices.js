const orderStatusModel = require("../model/orderStatusModel");
const mongoose = require("mongoose");
const projection = require("../config/mongoProjection");

const orderStatusServices = {
  get: async () => {
    const result = await orderStatusModel.find({}, projection.projection);
    return result;
  },
  addNew: async (orderStatusName) => {
    const permission = new orderStatusModel({
      orderStatusName,
    });
    const result = await permission.save();
    return result;
  },
};
module.exports = orderStatusServices;
