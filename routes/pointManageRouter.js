const express = require("express");
const expressAsyncHandler = require("express-async-handler");
const pointManageServices = require("../services/pointManageServices");
const pointManageRouter = express.Router();

pointManageRouter.get(
  "/all",
  expressAsyncHandler(async (req, res) => {
    const result = await pointManageServices.get();
    res.status(200).send({ msg: "Points", data: result });
  })
);
pointManageRouter.get(
  "/getOne",
  expressAsyncHandler(async (req, res) => {
    const { pointId } = req.query;
    const result = await pointManageServices.getOne(pointId);
    if (result) {
      return res.status(200).send({ msg: "Points", data: result });
    } else {
      return res.status(400).send({ msg: "Point Not Found" });
    }
  })
);
pointManageRouter.post(
  "/",
  expressAsyncHandler(async (req, res) => {
    const { initialPoint, pointOrderPrice, pointPerOrder } = req.body;
    if (!initialPoint || !pointPerOrder) {
      return res.status(400).send({ msg: "Fields Missing" });
    }
    const result = await pointManageServices.addNew(
      initialPoint,
      pointOrderPrice,
      pointPerOrder
    );
    if (result) {
      return res.status(200).send({ msg: "Point added.", data: result });
    } else {
      return res.status(400).send({ msg: "Point not added" });
    }
  })
);
pointManageRouter.patch(
  "/",
  expressAsyncHandler(async (req, res) => {
    const { pointManageId, initialPoint, pointOrderPrice, pointPerOrder } =
      req.body;
    if (!pointManageId || !initialPoint || !pointOrderPrice || !pointPerOrder) {
      return res.status(400).send({ msg: "Fields Missing" });
    }
    const result = await pointManageServices.update(
      pointManageId,
      initialPoint,
      pointOrderPrice,
      pointPerOrder
    );
    if (result) {
      return res.status(200).send({ msg: "Point updated.", data: result });
    } else {
      return res.status(400).send({ msg: "Point not updated" });
    }
  })
);
pointManageRouter.delete(
  "/",
  expressAsyncHandler(async (req, res) => {
    const { pointManageId } = req.body;
    if (!pointManageId) {
      return res.status(400).send({ msg: "Fields Missing" });
    }
    const result = await pointManageServices.delete(pointManageId);
    if (result.deletedCount == 0) {
      return res.status(400).send({ msg: "ID Not found" });
    }
    if (result) {
      return res.status(200).send({ msg: "Point deleted.", data: result });
    } else {
      return res.status(400).send({ msg: "Point not deleted" });
    }
  })
);

module.exports = pointManageRouter;
