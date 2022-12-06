const favouriteModel = require("../model/favouritesModel");
const projection = require("../config/mongoProjection");
const mongoose = require("mongoose");
const productsModel = require("../model/productsModel");
const productsServices = require("./productsServices");

const favouriteServices = {
  getFavourites: async (customerId) => {
    let list = await favouriteModel
      .find({ customer: { $in: customerId } }, projection.projection)
      .populate({
        path: "product",
        select: {
          _id: 1,
          name: 1,
          thumbnail: 1,
          variant: 1,
        },
      })
      .lean();
    if (list.length != 0) {
      list = list.map((item) => {
        const isFavourite = "true";
        item.product.actualPrice = item.product.variant[0].actualPrice;
        item.product.isFavourite = isFavourite;
        delete item.product.variant;
        return item;
      });
    }
    return list;
  },
  add: async (customer, product) => {
    var res = await favouriteModel.find({
      customer: customer,
      product: product,
    });
    //No favourite available
    if (res.length == 0) {
      result = new favouriteModel({
        customer,
        product,
      });
      result = await result.save();
      result = "Favourite added";
      return result;
    } else {
      let result = await favouriteModel.deleteOne({
        customer: customer,
        product: product,
      });
      result = "Favourite Deleted";
      return result;
    }
  },
  delete: async (_id) => {
    let result = await favouriteModel.deleteOne({
      _id,
    });
    return result;
  },
};

module.exports = favouriteServices;
