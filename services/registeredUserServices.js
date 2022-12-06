const registeredUserModel = require("../model/registeredUserModel");
const projection = require("../config/mongoProjection");
const mongoose = require("mongoose");

const registeredUserServices = {
  addNew: async (customerId, membershipId, status, isActive) => {
    const data = new registeredUserModel({
      customerId: mongoose.Types.ObjectId(customerId),
      membershipId: mongoose.Types.ObjectId(membershipId),
      status,
      isActive,
    });
    const result = await data.save();
    return result;
  },
  get: async () => {
    const result = await registeredUserModel
      .find({}, projection.projection)
      .populate({
        path: "customerId",
        select: { firstName: 1, lastName: 1, contact: 1, email: 1, _id: 1 },
      })
      .populate({
        path: "membershipId",
        select: { membershipCategory: 1, _id: 1 },
      });
    return result;
  },
};
module.exports = registeredUserServices;
