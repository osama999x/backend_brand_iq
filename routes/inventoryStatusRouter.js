const express = require("express");
const expressAsyncHandler = require("express-async-handler");
const inventryStatusServices = require("../services/inventoryStatusServices");
const inventoryStatusRouter = express.Router();
inventoryStatusRouter.get(
  "/all",
  expressAsyncHandler(async (req, res) => {
    // const { productId } = req.body;
    const result = await inventryStatusServices.get();
    if (result) {
      return res.status(200).send({ msg: "Inventory Status", data: result });
    } else {
      return res.status(400).send({ msg: "Inventory Status Not Found" });
    }
  })
);

module.exports = inventoryStatusRouter;
