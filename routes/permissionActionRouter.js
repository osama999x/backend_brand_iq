const express = require("express");
const expressAsyncHandler = require("express-async-handler");
const permissionActionServices = require("../services/permissionActionServices");
const permissionActionRouter = express.Router();
permissionActionRouter.post(
  "/",
  expressAsyncHandler(async (req, res) => {
    const { route, perm_name } = req.body;
    const result = await permissionActionServices.create(perm_name, route);
    if (result) {
      res.status(200).send({
        msg: "Permission Action Added",
        data: result,
      });
    } else {
      res.status(400).send({
        msg: "Permission Action Failed To Added",
        data: result,
      });
    }
  })
);
permissionActionRouter.get(
  "/all",
  expressAsyncHandler(async (req, res) => {
    const result = await permissionActionServices.get();
    if (result) {
      res.status(200).send({
        msg: "Permission Action ",
        data: result,
      });
    } else {
      res.status(400).send({
        msg: "Permission Action Not Found",
        data: result,
      });
    }
  })
);
module.exports = permissionActionRouter;
