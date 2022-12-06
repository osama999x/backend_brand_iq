var express = require("express");
var multer = require("multer");
const testRouter = express.Router();
var testModel = require("../model/testModel");
const reader = require("xlsx");
const testServices = require("../services/testServices");
const path = require("path");
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
module.exports = testRouter;
