const { default: mongoose } = require("mongoose");
const orderLogModel = require("../model/orderLogModel");

module.exports = async (courierType, status, orderId) => {
  const now = new Date();
const formattedDate = now.toISOString().slice(0, 19).replace("T", " ");
console.log(formattedDate);
  const data = new orderLogModel({
    deliveryPartner: courierType,
    orderStatus: status,
    orderId: mongoose.Types.ObjectId(orderId),
    time: formattedDate,
  });
  const result = await data.save();
  return result;
};
