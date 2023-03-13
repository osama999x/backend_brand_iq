const express = require("express");
const expressAsyncHandler = require("express-async-handler");
const reviewServices = require("../services/reviewServices");
const uploadFile = require("../utils/uploadFile");
const reviewRouter = express.Router();
reviewRouter.get(
  "/all",
  expressAsyncHandler(async (req, res) => {
    const result = await reviewServices.get();
    return res.status(200).send({
      msg: "Reviews",
      data: result,
    });
  })
);
reviewRouter.patch(
  "/approvedReview",
  expressAsyncHandler(async (req, res) => {
    const { reviewId } = req.body;
    let isApproved = await reviewServices.checkApproved(reviewId);
    if (isApproved) {
      return res.status(400).send({ msg: "Review already Approved!" });
    }
    const result = await reviewServices.approvedReview(reviewId);
    if (result) {
      return res.status(200).send({
        msg: "Review Approved",
        data: result,
      });
    } else {
      return res.status(400).send({ msg: "Review Not Approved" });
    }
  })
);
reviewRouter.get(
  "/customerReviewDetails",
  expressAsyncHandler(async (req, res) => {
    const { reviewId } = req.query;
    const result = await reviewServices.customerReviewDetails(reviewId);
    if (result) {
      return res.status(200).send({
        msg: "Reviews",
        data: result,
      });
    } else {
      return res.status(400).send({ msg: "Review Not Found" });
    }
  })
);
reviewRouter.get(
  "/product",
  expressAsyncHandler(async (req, res) => {
    const { productId } = req.query;
    const result = await reviewServices.getProductReview(productId);
    if (result.length != 0) {
      return res.status(200).send({
        msg: "Product Reviews",
        data: result,
      });
    } else {
      return res.status(400).send({ msg: "Review Not Found" });
    }
  })
);
reviewRouter.get(
  "/getPoductAllReviews",
  expressAsyncHandler(async (req, res) => {
    const { productId } = req.query;
    const { result, ID } = await reviewServices.getReviews(productId);
    if (result.length != 0) {
      return res.status(200).send({
        msg: "Product Reviews",
        id: ID,
        data: result,
      });
    } else {
      return res
        .status(200)
        .send({ msg: "Review Not Found", id: productId, data: [] });
    }
  })
);
reviewRouter.post(
  "/",
  expressAsyncHandler(async (req, res) => {
    const { productId, customerId, rating, comment, images, channel } =
      req.body;
    if (!productId || !customerId) {
      return res.status(400).send({ msg: "Fields Missing" });
    }
    var imgArr = [];
    if (images.length != 0) {
      var arrayLength = images.length;
      for (var i = 0; i < arrayLength; i++) {
        img = await uploadFile(images[i]);
        imgArr.push(img);
      }
    }

    const result = await reviewServices.addNewRate(
      productId,
      customerId,
      rating,
      comment,
      imgArr,
      channel
    );
    if (result) {
      return res.status(200).send({ msg: "Review added" });
    } else {
      return res.status(400).send({ msg: "Review not added" });
    }
  })
);
reviewRouter.delete(
  "/",
  expressAsyncHandler(async (req, res) => {
    const { reviewId } = req.body;
    const result = await reviewServices.delete(reviewId);
    if (result) {
      return res.status(200).send({
        msg: "Reviews Deleted",
        data: result,
      });
    } else {
      return res.status(400).send({ msg: "Review Not Deleted" });
    }
  })
);
module.exports = reviewRouter;
