const express = require("express");
const expressAsyncHandler = require("express-async-handler");
const pointsServices = require("../services/pointsServices");
const pointsRouter = express.Router();

pointsRouter.get(
  "/all",
  expressAsyncHandler(async (req, res) => {
    const result = await pointsServices.get();
    res.status(200).send({
      msg: "Points",
      data: result,
    });
  })
);
pointsRouter.get(
  "/points",
  expressAsyncHandler(async (req, res) => {
    const { pointsId } = req.body;
    const result = await pointsServices.getOne(pointsId);
    if (result) {
      return res.status(200).send({
        msg: "Points",
        data: result,
      });
    } else {
      return res.status(400).send({ msg: "Points Not Found" });
    }
  })
);

pointsRouter.post(
  "/",
  expressAsyncHandler(async (req, res) => {
    const { membershipCategoryId, returnValue } = req.body;
    if (!membershipCategoryId || !returnValue) {
      return res.status(400).send({ msg: "Fields Missing" });
    }
    const result = await pointsServices.addNew(
      membershipCategoryId,
      returnValue
    );
    if (result) {
      return res.status(200).send({ msg: "Points added.", data: result });
    } else {
      return res.status(400).send({ msg: "Points not added" });
    }
  })
);

pointsRouter.patch(
  "/",
  expressAsyncHandler(async (req, res) => {
    const { pointsId, membershipCategoryId, returnValue } = req.body;
    const result = await pointsServices.update(
      pointsId,
      membershipCategoryId,
      returnValue
    );
    if (result) {
      return res.status(200).send({ msg: "Data updated.", data: result });
    } else {
      return res.status(400).send({ msg: "Data not updated" });
    }
  })
);
pointsRouter.delete(
  "/",
  expressAsyncHandler(async (req, res) => {
    const { pointsId } = req.body;
    const result = await pointsServices.delete(pointsId);
    if (result.deletedCount == 0) {
      return res.status(400).send({ msg: "ID Not found" });
    }
    if (result) {
      return res.status(200).send({ msg: "Data deleted.", data: result });
    } else {
      return res.status(400).send({ msg: "Data not deleted" });
    }
  })
);

module.exports = pointsRouter;
