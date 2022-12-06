const express = require("express");
const expressAsyncHandler = require("express-async-handler");
const discountServices = require("../services/discountServices");
const discountRouter = express.Router();

discountRouter.get(
  "/all",
  expressAsyncHandler(async (req, res) => {
    const result = await discountServices.get();
    if (result.length !== 0) {
      return res.status(200).send({
        msg: "discounts",
        data: result,
      });
    } else {
      return res.status(400).send({ msg: "Discounts Not Found" });
    }
  })
);
discountRouter.post(
  "/",
  expressAsyncHandler(async (req, res) => {
    const {
      categoryId,
      subcategoryId,
      productId,
      originalPrice,
      discountPrice,
      fromDate,
      toDate,
    } = req.body;
    if (
      !categoryId ||
      !subcategoryId ||
      !productId ||
      !originalPrice ||
      !discountPrice ||
      !fromDate ||
      !toDate
    ) {
      return res.status(400).send({ msg: "Fields Missing" });
    }
    const result = await discountServices.addNew(
      categoryId,
      subcategoryId,
      productId,
      originalPrice,
      discountPrice,
      fromDate,
      toDate
    );
    if (result) {
      return res.status(200).send({ msg: "Discount added.", data: result });
    } else {
      return res.status(400).send({ msg: "Discount not added" });
    }
  })
);

discountRouter.patch(
  "/",
  expressAsyncHandler(async (req, res) => {
    const {
      discountId,
      categoryId,
      subcategoryId,
      productId,
      originalPrice,
      discountPrice,
      fromDate,
      toDate,
    } = req.body;
    const result = await discountServices.update(
      discountId,
      categoryId,
      subcategoryId,
      productId,
      originalPrice,
      discountPrice,
      fromDate,
      toDate
    );
    if (result) {
      return res.status(200).send({ msg: "Discount updated.", data: result });
    } else {
      return res.status(400).send({ msg: "Discount not updated" });
    }
  })
);
discountRouter.delete(
  "/",
  expressAsyncHandler(async (req, res) => {
    const { discountId } = req.body;
    const result = await discountServices.delete(discountId);
    if (result.deletedCount == 0) {
      return res.status(400).send({ msg: "ID Not found" });
    }
    if (result) {
      return res.status(200).send({ msg: "Discount deleted.", data: result });
    } else {
      return res.status(400).send({ msg: "Discount not deleted" });
    }
  })
);

module.exports = discountRouter;
