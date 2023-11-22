const reviewModel = require("../model/reviewModel");
const productsModel = require("../model/productsModel");
const projection = require("../config/mongoProjection");
const mongoose = require("mongoose");
// const productsImagesModel = require("../model/productsImagesModel");

const reviewServices = {
  get: async () => {
    const reviews = await reviewModel.aggregate([
      {
        $lookup: {
          from: "customers",
          localField: "customerId",
          foreignField: "_id",
          as: "customer",
        },
      },
      {
        $unwind: {
          path: "$customer",
        },
      },
      {
        $lookup: {
          from: "products",
          localField: "productId",
          foreignField: "_id",
          as: "product",
        },
      },
      {
        $unwind: {
          path: "$product",
        },
      },
      {
        $project: {
          isApproved: 1,
          status: 1,
          channel: 1,
          "customer._id": "$customer._id",
          "customer.name": {
            $concat: ["$customer.firstName", " ", "$customer.lastName"],
          },
          "customer.contact": "$customer.contact",
          "customer.membershipCategory": "$customer.membershipCategory",
          "product._id": "$product._id",
          "product.name": "$product.name",
        },
      },
    ]);
    // .find({}, { _id: 1, channel: 1, isApproved: 1 })
    // .populate({
    //   path: "customerId",
    //   select: {
    //     firstName: 1,
    //     lastName: 1,
    //     membershipCategory: 1,
    //     contact: 1,
    //     channel: 1,
    //   },
    // });

    return reviews;
  },
  checkApproved: async (reviewId, isApproved) => {
    const result = await reviewModel.findOne({
      _id: reviewId,
      isApproved,
    });
    return result;
  },
  approvedReview: async (reviewId, isApproved) => {
    let status;
    status = isApproved === true ? "approved" : "rejected";
    const result = await reviewModel.findOneAndUpdate(
      { _id: reviewId },
      { isApproved: isApproved, status },
      { new: true }
    );
    if (result) {
      let up = await productsModel.findOneAndUpdate(
        { _id: result.productId },
        {
          $inc: { ratingCount: 1, ratingNumber: result.rating },
        },
        {
          new: true,
        }
      );
      console.log("up", up);
    }
    return result;
  },
  customerReviewDetails: async (reviewId) => {
    const result = await reviewModel.aggregate([
      {
        $match: {
          _id: new mongoose.Types.ObjectId(reviewId),
        },
      },
      {
        $lookup: {
          from: "customers",
          localField: "customerId",
          foreignField: "_id",
          as: "customer",
        },
      },
      {
        $unwind: {
          path: "$customer",
        },
      },
      {
        $lookup: {
          from: "products",
          localField: "productId",
          foreignField: "_id",
          as: "product",
        },
      },
      {
        $unwind: {
          path: "$product",
        },
      },
      {
        $project: {
          rating: 1,
          comment: 1,
          images: 1,
          customerName: {
            $concat: ["$customer.firstName", " ", "$customer.lastName"],
          },
          productName: "$product.name",
        },
      },
    ]);
    //   .findOne(
    //     { _id: { $in: reviewId }, isApproved: true },
    //     { rating: 1, comment: 1, images: 1 }
    //   )
    //   .populate({
    //     path: "productId",
    //     select: {
    //       name: 1,
    //       _id: 1,
    //     },
    //   })
    //   .populate({
    //     path: "customerId",
    //     select: {
    //       _id: 1,
    //       firstName: 1,
    //       lastName: 1,
    //       contact: 1,
    //     },
    //   })
    //   .lean();
    // if (result) {
    //   const whiteSpace = " ";
    //   result.comment = result.comment;
    //   result.customerName = result.customerId.firstName.concat(
    //     whiteSpace,
    //     result.customerId.lastName
    //   );
    //   result.productName = result.productId.name;
    //   delete result.productId;
    //   delete result.customerId;
    // }
    return result[0];
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
        item.actualPrice = item.productId.variant[0].actualPrice;
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
      images[0] = "images/profile.png";
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

    return result;
  },
  delete: async (_id) => {
    var _id = mongoose.Types.ObjectId(_id);
    let result = await reviewModel.deleteOne({ _id });
    return result;
  },
};

module.exports = reviewServices;
