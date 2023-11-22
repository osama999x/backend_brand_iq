const express = require("express");
const expressAsyncHandler = require("express-async-handler");
const taxTypeServices = require("../services/taxTypeServices");
const taxHeadServices = require("../services/taxHeadServices");
const taxTypeRouter = express.Router();

taxTypeRouter.get(
  "/",
  expressAsyncHandler(async (req, res) => {
    const result = await taxTypeServices.get();
    res.status(200).send({
      msg: "tax types",
      data: result,
    });
  })
);
taxTypeRouter.get(
  "/getOne",
  expressAsyncHandler(async (req, res) => {
    const { taxTypeId } = req.query;
    const result = await taxTypeServices.getOne(taxTypeId);
    if (result) {
      return res.status(200).send({
        msg: "tax types",
        data: result,
      });
    } else {
      return res.status(400).send({ msg: "tax types Not Found" });
    }
  })
);
taxTypeRouter.post(
  "/",
  expressAsyncHandler(async (req, res) => {
    const { taxType } = req.body;
    if (!taxType) {
      return res.status(400).send({ msg: "Missing Fields" });
    }
    const result = await taxTypeServices.add(taxType);
    if (result) {
      return res.status(200).send({
        msg: "tax type added.",
        data: result,
      });
    } else {
      return res.status(400).send({ msg: "tax type not added" });
    }
  })
);

taxTypeRouter.patch(
  "/",
  expressAsyncHandler(async (req, res) => {
    const { taxTypeId, taxType } = req.body;
    if (!taxType || !taxTypeId) {
      return res.status(400).send({ msg: "Missing Fields" });
    }
    const result = await taxTypeServices.update(taxTypeId, taxType);
    if (result) {
      return res.status(200).send({ msg: "tax type updated.", data: result });
    } else {
      return res.status(400).send({ msg: "Tax type not updated" });
    }
  })
);
taxTypeRouter.delete(
  "/",
  expressAsyncHandler(async (req, res) => {
    const { taxTypeId } = req.body;
    const isAttach = await taxHeadServices.isExist(taxTypeId);
    if (isAttach) {
      return res.status(400).send({
        msg: "This tax type attach with tax head!",
      });
    }
    const result = await taxTypeServices.delete(taxTypeId);
    if (result.deletedCount == 0) {
      return res.status(400).send({ msg: "ID Not found" });
    }
    if (result) {
      return res.status(200).send({ msg: "tax type deleted.", data: result });
    } else {
      return res.status(400).send({ msg: "tax type not deleted" });
    }
  })
);

module.exports = taxTypeRouter;
