const reviewModel = require("../model/reviewModel");
const productsModel = require("../model/productsModel");
const projection = require("../config/mongoProjection");
const mongoose = require("mongoose");
// const productsImagesModel = require("../model/productsImagesModel");

const reviewServices = {
  get: async () => {
    const reviews = await reviewModel
      .find({}, { _id: 1, channel: 1, isApproved: 1 })
      .populate({
        path: "customerId",
        select: {
          firstName: 1,
          lastName: 1,
          membershipCategory: 1,
          contact: 1,
          channel: 1,
        },
      });
    return reviews;
  },
  approvedReview: async (reviewId, isApproved) => {
    const result = await reviewModel.findOneAndUpdate(
      { _id: reviewId },
      { isApproved: isApproved }
    );
    return result;
  },
  customerReviewDetails: async (reviewId) => {
    const result = await reviewModel
      .findOne(
        { _id: { $in: reviewId }, isApproved: true },
        { rating: 1, comment: 1, images: 1 }
      )
      .populate({
        path: "productId",
        select: {
          name: 1,
          _id: 1,
        },
      })
      .populate({
        path: "customerId",
        select: {
          _id: 1,
          firstName: 1,
          lastName: 1,
          contact: 1,
        },
      })
      .lean();
    if (result) {
      const whiteSpace = " ";
      result.comment = result.comment;
      result.customerName = result.customerId.firstName.concat(
        whiteSpace,
        result.customerId.lastName
      );
      result.productName = result.productId.name;
      delete result.productId;
      delete result.customerId;
    }
    return result;
  },
  getProductReview: async (productId) => {
    // productId:mongoose.Types.ObjectId(productId)
    let result = await reviewModel
      .find(
        { productId: { $in: productId }, isApproved: true },
        projection.projection
      )
      .populate({
        path: "productId",
        select: {
          name: 1,
          _id: 1,
          variant: 1,
        },
      })
      .populate({
        path: "customerId",
        select: { name: 1 },
      })
      .lean();
    if (result) {
      result = result.map((item) => {
        item.productName = item.productId.name;
        // item.productRatingNumber = item.productId.ratingNumber;
        item.discountedPrice = item.productId.variant[0].discountedPrice;

        delete item.productId;
        return item;
      });
    }
    return result;
  },
  getReviews: async (productId) => {
    // productId:mongoose.Types.ObjectId(productId)
    var result = await reviewModel
      .find(
        { productId: { $in: productId }, isApproved: true },
        { images: 1, rating: 1 }
      )
      .populate({
        path: "productId",
        select: {
          name: 1,
          _id: 1,
          variant: 1,
        },
      })
      .populate({
        path: "customerId",
        select: { firstName: 1, lastName: 1 },
      })
      .lean();
    if (result.length != 0) {
      var ID = result[0].productId._id.toString();
      var list = result.map((item) => {
        item.image = item.images;
        item.productName = item.productId.name;
        // item.Id = item.productId._id;
        item.discountedPrice = item.productId.variant[0].discountedPrice;
        const whiteSpace = " ";
        item.customerName = item.customerId.firstName.concat(
          whiteSpace,
          item.customerId.lastName
        );
        delete item.productId;
        delete item.customerId;
        delete item.images;
        return item;
      });
      result.list = list;
    }
    return { result, ID };
  },
  addNewRate: async (
    productId,
    customerId,
    rating,
    comment,
    images,
    channel
  ) => {
    if (images.length === 0) {
      images = null;
    }
    const data = new reviewModel({
      productId: mongoose.Types.ObjectId(productId),
      customerId: mongoose.Types.ObjectId(customerId),
      rating,
      comment,
      images,
      channel,
    });
    const result = await data.save();
    if (result) {
      await productsModel.findOneAndUpdate(
        { productId },
        {
          $inc: { ratingCount: 1, ratingNumber: rating },
        },
        {
          new: true,
        }
      );
    }
    return result;
  },
  delete: async (_id) => {
    var _id = mongoose.Types.ObjectId(_id);
    let result = await reviewModel.deleteOne({ _id });
    return result;
  },
};

module.exports = reviewServices;
