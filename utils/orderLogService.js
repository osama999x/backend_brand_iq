const { default: mongoose } = require("mongoose");
const orderLogModel = require("../model/orderLogModel");

module.exports = async (courierType, status, orderId) => {
  const time = new Date(new Date().toLocaleDateString());
  const data = new orderLogModel({
    deliveryPartner: courierType,
    orderStatus: status,
    orderId: mongoose.Types.ObjectId(orderId),
    time,
  });
  const result = await data.save();
  return result;
};
