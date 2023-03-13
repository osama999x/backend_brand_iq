const express = require("express");
const expressAsyncHandler = require("express-async-handler");
const subModuleServices = require("../services/subModuleServices");
const subModuleRouter = express.Router();
subModuleRouter.post(
  "/",
  expressAsyncHandler(async (req, res) => {
    const { label, route, module, permissions } = req.body;
    const result = await subModuleServices.create(
      label,
      route,
      module,
      permissions
    );
    if (result) {
      res.status(200).send({
        msg: "Sub Module Added",
        data: result,
      });
    } else {
      res.status(400).send({
        msg: "Sub Module Failed To Added",
        data: result,
      });
    }
  })
);

subModuleRouter.get(
  "/all",
  expressAsyncHandler(async (req, res) => {
    const result = await subModuleServices.get();
    res.status(200).send({
      msg: "Sub Modules",
      data: result,
    });
  })
);
subModuleRouter.get(
  "/submoduleByModule",
  expressAsyncHandler(async (req, res) => {
    const { moduleId } = req.query;
    const result = await subModuleServices.submoduleByModule(moduleId);
    if (result) {
      return res.status(200).send({
        msg: "Sub Modules",
        data: result,
      });
    } else {
      return res.status(400).send({
        msg: "Sub Modules Not Found",
      });
    }
  })
);
module.exports = subModuleRouter;
