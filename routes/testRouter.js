var express = require("express");
var multer = require("multer");
const testRouter = express.Router();
var testModel = require("../model/testModel");
const reader = require("xlsx");
const testServices = require("../services/testServices");
const path = require("path");
const orderModel = require("../model/orderModel");
const expressAsyncHandler = require("express-async-handler");
const decryptRequest = require("../middleware/decryptRequest");
const encryptRequest = require("../middleware/encryptRequest");
var storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./uploads");
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});
var uploads = multer({ storage: storage });
testRouter.get("/all", async (req, res) => {
  const result = await testServices.get();
  if (result) {
    res.status(200).send({
      msg: "data",
      data: result,
    });
  } else {
    res.status(400).send({
      msg: "Not found",
      data: result,
    });
  }
});
testRouter.post("/", uploads.single("csv"), async (req, res) => {
  const file = reader.readFile(req.file.path);
  const result = await testServices.addNew(file);
  if (result) {
    res.status(200).send({
      msg: "Added",
      data: result,
    });
  } else {
    res.status(400).send({
      msg: "Not Added",
      data: result,
    });
  }
});
testRouter.post(
  "/cipherToData",
  expressAsyncHandler(async (req, res) => {
    const { cipher } = req.body;
    if (cipher == undefined) {
      res.status(400).send({ msg: "Please send data into cipher!" });
      return;
    }
    const result = decryptRequest(cipher);
    if (result) {
      res.status(200).send(result);
    } else {
      res.status(400).send({
        msg: "Failed",
      });
    }
  })
);
testRouter.post(
  "/dataToCipher",
  expressAsyncHandler(async (req, res) => {
    // const { data } = req.body;
    // console.log(data);
    console.log(req.body);
    const result = encryptRequest(req.body);
    if (result) {
      res.status(200).send(result);
    } else {
      res.status(400).send({
        msg: "Failed",
      });
    }
  })
);
testRouter.post("/orderUpdate", async (req, res) => {
  const { orderId, productId } = req.body;
  const result = await testServices.updateOrder(orderId, productId);
  if (result) {
    res.status(200).send({
      msg: "update",
      date: result,
    });
  } else {
    res.status(200).send({
      msg: "not updated",
    });
  }
});
module.exports = testRouter;
