const express = require("express");
const expressAsyncHandler = require("express-async-handler");
const dealServices = require("../services/dealServices");
const dealRouter = express.Router();
dealRouter.get(
  "/all",
  expressAsyncHandler(async (req, res) => {
    const result = await dealServices.get();
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
dealRouter.get(
  "/todayDeal",
  expressAsyncHandler(async (req, res) => {
    const result = await dealServices.todayDeal();
    res.status(200).send({
      msg: "Deal Products",
      data: result,
    });
  })
);
dealRouter.get(
  "/todayList",
  expressAsyncHandler(async (req, res) => {
    const result = await dealServices.todayDealList();
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
dealRouter.get(
  "/getOne",
  expressAsyncHandler(async (req, res) => {
    const { dealsId } = req.query;
    const result = await dealServices.getOne(dealsId);
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
dealRouter.get(
  "/getOneWeb",
  expressAsyncHandler(async (req, res) => {
    const { dealsId } = req.query;
    const result = await dealServices.getOneWeb(dealsId);
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
dealRouter.post(
  "/",
  expressAsyncHandler(async (req, res) => {
    const {
      dealTitle,
      dealType,
      dealDescription,
      image,
      isPercentage,
      discount,
      dealFrom,
      dealTo,
    } = req.body;

    if (!dealTitle || !dealType || !discount || !dealFrom || !dealTo) {
      return res.status(400).send({
        msg: "Fields Missing",
      });
    }
    // if (dealType === "other" && (!getDeal || !dealFrom || !dealTo)) {
    //   return res.status(400).send({
    //     msg: "Fields Missing",
    //   });
    // }
    const result = await dealServices.addNew(
      dealTitle,
      dealType,
      dealDescription,
      image,
      isPercentage,
      discount,
      dealFrom,
      dealTo
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
dealRouter.patch(
  "/",
  expressAsyncHandler(async (req, res) => {
    const {
      dealsId,
      dealTitle,
      dealType,
      dealDescription,
      image,
      isPercentage,
      discount,
      dealFrom,
      dealTo,
    } = req.body;
    const result = await dealServices.update(
      dealsId,
      dealTitle,
      dealType,
      dealDescription,
      image,
      isPercentage,
      discount,
      dealFrom,
      dealTo
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
dealRouter.delete(
  "/",
  expressAsyncHandler(async (req, res) => {
    const { dealsId } = req.body;
    const result = await dealServices.delete(dealsId);
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
module.exports = dealRouter;
