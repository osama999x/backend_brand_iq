const addToCartModel = require("../model/addToCartModel");
const projection = require("../config/mongoProjection");
const mongoose = require("mongoose");
const productsModel = require("../model/productsModel");

const addToCartServices = {
  get: async (customerId) => {
    var list = await addToCartModel
      .find({ customer: { $in: customerId } }, projection.projection)
      .populate({
        path: "products.productId",
        select: {
          _id: 1,
          name: 1,
          variant: 1,
          thumbnail: 1,
        },
      })
      .lean();
    if (list.length != 0) {
      list = list.map((item) => {
        var productArr = [];
        for (let i of item.products) {
          Id = i.productId._id;
          name = i.productId.name;
          // actualPrice = i.productId.variant[0].actualPrice;
          // discountedPrice = i.productId.variant[0].discountedPrice;
          thumbnail = i.productId.thumbnail;
          quantity = i.quantity;
          price = i.price;
          sku = i.sku;
          size = i.size;
          delete item.products;
          productArr.push({
            ID: Id,
            name: name,
            price: price,
            // actualPrice: actualPrice,
            // discountedPrice: discountedPrice,
            thumbnail: thumbnail,
            quantity: quantity,
            sku: sku,
            size: size,
          });
        }
        return productArr;
      });
    }
    return list;
  },
  addNewToCart: async (customer, products) => {
    await addToCartModel.deleteOne({ customer: { $in: customer } });
    const data = new addToCartModel({
      customer,
      products,
    });
    const result = await data.save();
    return result;
  },
  delete: async (_id) => {
    let result = await addToCartModel.deleteOne({
      _id,
    });
    return result;
  },
};

module.exports = addToCartServices;
