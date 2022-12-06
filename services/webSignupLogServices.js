const userModel = require("../model/userModel");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const projection = require("../config/mongoProjection");
const roleRouter = require("../routes/roleRouter");
const userResetPasswordModel = require("../model/userResetPaswordModel");
const userSendEmail = require("../utils/userSendEmail");
const webSignupLogRouter = require("../routes/webSignupLogRouter");
const WebSignupLogModel = require("../model/webSignupLogModel");

const webSignupLogServices = {
  get: async () => {
    let result = await WebSignupLogModel.aggregate([
      {
        $group: {
          _id: {
            month: { $month: "$time" },
            monthOfday: { $dayOfMonth: "$time" },
            // customer: "$customer",
          },
          visit: { $sum: 1 },
        },
      },
    ]);
    if (result.length != 0) {
      result = result.map((item) => {
        item.month = item._id.month;
        item.dateofMonth = item._id.monthOfday;
        // item.customer = item._id.customer;
        item.noOfVisit = item.visit;
        delete item._id;
        delete item.visit;
        return item;
      });
    }
    return result;
  },
};
module.exports = webSignupLogServices;
