const express = require("express");
const expressAsyncHandler = require("express-async-handler");
const feeSlabServices = require("../services/feeSlabServices");
const feeSlabRouter = express.Router();
feeSlabRouter.get(
  "/all",
  expressAsyncHandler(async (req, res) => {
    const result = await feeSlabServices.get();
    if (result.length != 0) {
      return res.status(200).send({
        msg: "fee Slab",
        data: result,
      });
    } else {
      return res.status(400).send({ msg: "Fee Slab Not Found", data: result });
    }
  })
);
feeSlabRouter.post(
  "/",
  expressAsyncHandler(async (req, res) => {
    const { membershipCategoryId, feeSlabFrom, feeSlabTo } = req.body;
    if (!membershipCategoryId || !feeSlabFrom || !feeSlabTo) {
      return res.status(400).send({ msg: "Fields Missing" });
    }
    const result = await feeSlabServices.addNew(
      membershipCategoryId,
      feeSlabFrom,
      feeSlabTo
    );
    if (result) {
      return res.status(200).send({ msg: "fee Slab added.", data: result });
    } else {
      return res.status(400).send({ msg: "fee Slab not added" });
    }
  })
);
feeSlabRouter.patch(
  "/",
  expressAsyncHandler(async (req, res) => {
    const { feeSlabId, membershipCategoryId, feeSlabFrom, feeSlabTo } =
      req.body;
    if (!membershipCategoryId || !feeSlabFrom || !feeSlabTo) {
      return res.status(400).send({ msg: "Fields Missing" });
    }
    const result = await feeSlabServices.update(
      feeSlabId,
      membershipCategoryId,
      feeSlabFrom,
      feeSlabTo
    );
    if (result) {
      return res.status(200).send({ msg: "Fee Slab updated.", data: result });
    } else {
      return res.status(400).send({ msg: "Fee Slab not updated" });
    }
  })
);
feeSlabRouter.delete(
  "/",
  expressAsyncHandler(async (req, res) => {
    const { feeSlabId } = req.body;
    const result = await feeSlabServices.delete(feeSlabId);
    if (result.deletedCount == 0) {
      return res.status(400).send({ msg: "ID Not found" });
    }
    if (result) {
      return res.status(200).send({ msg: "Fee Slab deleted.", data: result });
    } else {
      return res.status(400).send({ msg: "Fee Slab not deleted" });
    }
  })
);

module.exports = feeSlabRouter;
