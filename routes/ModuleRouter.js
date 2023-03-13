const express = require("express");
const expressAsyncHandler = require("express-async-handler");
const moduleServices = require("../services/moduleServices");
const moduleRouter = express.Router();
moduleRouter.post(
  "/",
  expressAsyncHandler(async (req, res) => {
    const { label, route, isSubModule, permissions } = req.body;
    const result = await moduleServices.create(
      label,
      route,
      isSubModule,
      permissions
    );
    if (result) {
      res.status(200).send({
        msg: "Module Added",
        data: result,
      });
    } else {
      res.status(400).send({
        msg: "Module Failed To Added",
        data: result,
      });
    }
  })
);
moduleRouter.get(
  "/all",
  expressAsyncHandler(async (req, res) => {
    const result = await moduleServices.get();
    res.status(200).send({
      msg: "Modules",
      data: result,
    });
  })
);
moduleRouter.get(
  "/getById",
  expressAsyncHandler(async (req, res) => {
    const { moduleId } = req.query;
    const result = await moduleServices.getById(moduleId);
    res.status(200).send({
      msg: "Sub Modules",
      data: result,
    });
  })
);
module.exports = moduleRouter;
