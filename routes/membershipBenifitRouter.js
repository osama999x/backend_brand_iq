const express = require("express");
const expressAsyncHandler = require("express-async-handler");
const membershipBenifitServices = require("../services/membershipBenifitServices");
const membershipBenifitRouter = express.Router();
membershipBenifitRouter.get(
  "/all",
  expressAsyncHandler(async (req, res) => {
    const result = await membershipBenifitServices.get();
    res.status(200).send({
      msg: "Membership Benifits",
      data: result,
    });
  })
);
membershipBenifitRouter.get(
  "/getOne",
  expressAsyncHandler(async (req, res) => {
    const { membershipBenifitId } = req.query;
    const result = await membershipBenifitServices.getMembershipCategories(
      membershipBenifitId
    );
    if (result) {
      return res.status(200).send({
        msg: "Membership Benifits",
        data: result,
      });
    } else {
      return res.status(400).send({ msg: "Membership Benifits Not Found" });
    }
  })
);
membershipBenifitRouter.post(
  "/",
  expressAsyncHandler(async (req, res) => {
    const { membershipCategory, label, description, image, expireDate } =
      req.body;
    if (!membershipCategory || !label || !description || !image) {
      return res.status(400).send({ msg: "Fields Missing" });
    }
    const result = await membershipBenifitServices.addNew(
      membershipCategory,
      label,
      description,
      image,
      expireDate
    );
    if (result) {
      return res
        .status(200)
        .send({ msg: "Membership Benifits added.", data: result });
    } else {
      return res.status(400).send({ msg: "Membership Benifits not added" });
    }
  })
);

membershipBenifitRouter.patch(
  "/",
  expressAsyncHandler(async (req, res) => {
    const {
      membershipBenifitId,
      membershipCategory,
      label,
      description,
      image,
      expireDate,
    } = req.body;
    const result = await membershipBenifitServices.update(
      membershipBenifitId,
      membershipCategory,
      label,
      description,
      image,
      expireDate
    );
    if (result) {
      return res
        .status(200)
        .send({ msg: "Membership Benifits updated.", data: result });
    } else {
      return res.status(400).send({ msg: "Membership Benifits not updated" });
    }
  })
);
membershipBenifitRouter.delete(
  "/",
  expressAsyncHandler(async (req, res) => {
    const { membershipBenifitId } = req.body;
    const result = await membershipBenifitServices.delete(membershipBenifitId);
    if (result.deletedCount == 0) {
      return res.status(400).send({ msg: "ID Not found" });
    }
    if (result) {
      return res
        .status(200)
        .send({ msg: "Membership Benifits deleted.", data: result });
    } else {
      return res.status(400).send({ msg: "Membership Benifits not deleted" });
    }
  })
);

module.exports = membershipBenifitRouter;
