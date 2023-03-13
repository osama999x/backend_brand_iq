const paymentModel = require("../model/paymentModel");

const paymentHistoryService = {
  new: async (user, billDetails, method, paymentDetails) => {
    const newPayment = new paymentModel({
      user: mongoose.Types.ObjectId(user),
      billDetails,
      method: method || "zindigi",
      paymentDetails,
    });
    const result = await newPayment.save();
    return result;
  },
  history: async (user) => {
    const list = await paymentModel.aggregate([
      {
        $match: {
          user: mongoose.Types.ObjectId(user),
        },
      },
      {
        $unwind: {
          path: "$billDetails",
        },
      },
      {
        $sort: {
          createdAt: -1,
        },
      },
      {
        $project: {
          billDetails: 1,
          method: 1,
          createdAt: 1,
        },
      },
    ]);
    return list;
  },
};

module.exports = paymentHistoryService;
