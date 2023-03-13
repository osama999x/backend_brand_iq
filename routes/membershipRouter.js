const express = require("express");
const expressAsyncHandler = require("express-async-handler");
const membershipServices = require("../services/membershipServices");
const membershipRouter = express.Router();

membershipRouter.get(
  "/all",
  expressAsyncHandler(async (req, res) => {
    const result = await membershipServices.get();
    res.status(200).send({
      msg: "Membership",
      data: result,
    });
  })
);
membershipRouter.get(
  "/getOne",
  expressAsyncHandler(async (req, res) => {
    const { membershipId } = req.query;
    const result = await membershipServices.getMembershipCategories(
      membershipId
    );
    if (result) {
      return res.status(200).send({
        msg: "Membership Categories",
        data: result,
      });
    } else {
      return res.status(400).send({ msg: "Membership Categories Not Found" });
    }
  })
);
membershipRouter.post(
  "/",
  expressAsyncHandler(async (req, res) => {
    const { membershipCategory, thresholdFrom, thresholdTo } = req.body;
    // if (!membershipCategory || !thresholdFrom || !thresholdTo) {
    //   return res.status(400).send({ msg: "Fields Missing" });
    // }
    const result = await membershipServices.addNew(
      membershipCategory,
      thresholdFrom,
      thresholdTo
    );
    if (result) {
      return res.status(200).send({ msg: "Membership added.", data: result });
    } else {
      return res.status(400).send({ msg: "Membership not added" });
    }
  })
);

membershipRouter.patch(
  "/",
  expressAsyncHandler(async (req, res) => {
    const { membershipId, thresholdFrom, thresholdTo } = req.body;
    const result = await membershipServices.update(
      membershipId,
      thresholdFrom,
      thresholdTo
    );
    if (result) {
      return res
        .status(200)
        .send({ msg: "Membership Range updated.", data: result });
    } else {
      return res.status(400).send({ msg: "Membership Range not updated" });
    }
  })
);
membershipRouter.delete(
  "/",
  expressAsyncHandler(async (req, res) => {
    const { membershipId } = req.body;
    const result = await membershipServices.delete(membershipId);
    if (result.deletedCount == 0) {
      return res.status(400).send({ msg: "ID Not found" });
    }
    if (result) {
      return res.status(200).send({ msg: "Membership deleted.", data: result });
    } else {
      return res.status(400).send({ msg: "Membership not deleted" });
    }
  })
);

module.exports = membershipRouter;
