const express = require("express");
const expressAsyncHandler = require("express-async-handler");
const dealsProductServices = require("../services/dealsProductServices");
const dealsProductRouter = express.Router();
dealsProductRouter.get(
  "/all",
  expressAsyncHandler(async (req, res) => {
    const result = await dealsProductServices.get();
    if (result.length != 0) {
      res.status(200).send({
        msg: "Deal Products",
        data: result,
      });
    } else {
      res.status(400).send({
        msg: "Deal Product Not Found",
      });
    }
  })
);
dealsProductRouter.get(
  "/todayList",
  expressAsyncHandler(async (req, res) => {
    const result = await dealsProductServices.todayList();
    if (result.length != 0) {
      res.status(200).send({
        msg: "Deal Products",
        data: result,
      });
    } else {
      res.status(400).send({
        msg: "Deal Product Not Found",
      });
    }
  })
);
dealsProductRouter.get(
  "/getOne",
  expressAsyncHandler(async (req, res) => {
    const { dealsId } = req.query;
    const result = await dealsProductServices.getOne(dealsId);
    if (result) {
      res.status(200).send({
        msg: "Deal Products",
        data: result,
      });
    } else {
      res.status(400).send({
        msg: "Deal Product Not Found",
      });
    }
  })
);
dealsProductRouter.post(
  "/",
  expressAsyncHandler(async (req, res) => {
    const { dealTitle, product, discount, date } = req.body;
    if (!dealTitle || !product || !discount || !date) {
      res.status(400).send({
        msg: "Fields Missing",
      });
    }
    const result = await dealsProductServices.addNew(
      dealTitle,
      product,
      discount,
      date
    );
    if (result) {
      res.status(200).send({
        msg: "Deal Product Added",
        data: result,
      });
    } else {
      res.status(400).send({
        msg: "Deal Product Not Added",
      });
    }
  })
);
dealsProductRouter.patch(
  "/",
  expressAsyncHandler(async (req, res) => {
    const { dealsId, dealTitle, product, discount, date } = req.body;
    const result = await dealsProductServices.update(
      dealsId,
      dealTitle,
      product,
      discount,
      date
    );
    if (result) {
      res.status(200).send({
        msg: "Deal Product Updated",
        data: result,
      });
    } else {
      res.status(400).send({
        msg: "Deal Product Not Updated",
      });
    }
  })
);
dealsProductRouter.delete(
  "/",
  expressAsyncHandler(async (req, res) => {
    const { dealsId } = req.body;
    const result = await dealsProductServices.delete(dealsId);
    if (result) {
      res.status(200).send({
        msg: "Deal Product Deleted",
        data: result,
      });
    } else {
      res.status(400).send({
        msg: "Deal Product Not Deleted",
      });
    }
  })
);
module.exports = dealsProductRouter;
