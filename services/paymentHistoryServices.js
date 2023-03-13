const { default: mongoose } = require("mongoose");
const paymentModel = require("../model/paymentModel");

const paymentHistoryService = {
  new: async (userId, orderId, method, paymentDetails, transaction_amount) => {
    const newPayment = new paymentModel({
      userId: mongoose.Types.ObjectId(userId),
      orderId: mongoose.Types.ObjectId(orderId),
      method: method || "zindigi",
      paymentDetails,
      transaction_amount,
    });
    const result = await newPayment.save();
    return result;
  },
  history: async (userId) => {
    const list = await paymentModel.aggregate([
      {
        $match: {
          userId: mongoose.Types.ObjectId(userId),
        },
      },
      {
        $sort: {
          createdAt: -1,
        },
      },
      {
        $project: {
          paymentDetails: 1,
          method: 1,
          createdAt: 1,
        },
      },
    ]);
    return list;
  },
};

module.exports = paymentHistoryService;
