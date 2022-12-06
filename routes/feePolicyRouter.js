const express = require("express");
const expressAsyncHandler = require("express-async-handler");
const feePolicyServices = require("../services/feePolicyServices");
const feePolicyRouter = express.Router();

feePolicyRouter.post(
  "/",
  expressAsyncHandler(async (req, res) => {
    const { feeSlabId, membershipCategoryId, charges } = req.body;

    if (!feeSlabId || !membershipCategoryId || !charges) {
      return res.status(400).send({ msg: "Fields Missing" });
    }
    const result = await feePolicyServices.addNew(
      feeSlabId,
      membershipCategoryId,
      charges
    );
    if (result) {
      return res.status(200).send({ msg: "Fee Policy added.", data: result });
    } else {
      return res.status(400).send({ msg: "Fee Policy not added" });
    }
  })
);

feePolicyRouter.get(
  "/all",
  expressAsyncHandler(async (req, res) => {
    const result = await feePolicyServices.get();
    if (result.length != 0) {
      return res.status(200).send({
        msg: "Fee Policy",
        data: result,
      });
    } else {
      return res
        .status(400)
        .send({ msg: "Fee Policy Not Found", data: result });
    }
  })
);
feePolicyRouter.patch(
  "/",
  expressAsyncHandler(async (req, res) => {
    const {
      feePolicyId,
      feeSlabId,
      membershipCategoryId,
      isPercentage,
      charges,
    } = req.body;
    const result = await feePolicyServices.update(
      feePolicyId,
      feeSlabId,
      membershipCategoryId,
      isPercentage,
      charges
    );
    if (result) {
      return res.status(200).send({ msg: "Fee Policy updated.", data: result });
    } else {
      return res.status(400).send({ msg: "Fee Policy not updated" });
    }
  })
);
feePolicyRouter.delete(
  "/",
  expressAsyncHandler(async (req, res) => {
    const { feePolicyId } = req.body;
    const result = await feePolicyServices.delete(feePolicyId);
    if (result) {
      return res.status(400).send({ msg: "ID Not found" });
    }
    if (result) {
      return res.status(200).send({ msg: "Fee Policy deleted.", data: result });
    } else {
      return res.status(400).send({ msg: "Fee Policy not deleted" });
    }
  })
);

module.exports = feePolicyRouter;
