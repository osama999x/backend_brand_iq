const { default: mongoose } = require("mongoose");
const productLogModel = require("../model/productLogModel");
const productsModel = require("../model/productsModel");

const productLogServices = {
  productLog: async (product, status, customerId) => {
    var productLength = product.length;
    for (let i = 0; i < productLength; i++) {
      productId = product[i].productId;
      quantity = product[i].quantity;
      price = product[i].price;
      sku = product[i].sku;
      size = product[i].size;
      const filter = { _id: productId, "variant.sku": sku };
      let update;
      if (status === "SOLD") {
        update = { $inc: { "variant.$.quantity": -quantity } };
      } else {
        update = { $inc: { "variant.$.quantity": +quantity } };
      }
      await productsModel.findOneAndUpdate(filter, update);
      let productLog = new productLogModel({
        product: mongoose.Types.ObjectId(productId),
        description: `${status} order,PRODUCTID:${productId},SKU:${sku},QUANTITY:${quantity},PRICE:${price},CUSTOMER:${customerId},Size:${size}`,
      });
      await productLog.save();
    }
  },
};
module.exports = productLogServices;
