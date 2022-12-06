const express = require("express");
const expressAsyncHandler = require("express-async-handler");
const roleServices = require("../services/roleServices");
const roleRouter = express.Router();

roleRouter.get(
  "/all",
  expressAsyncHandler(async (req, res) => {
    const result = await roleServices.get();
    if (result.length !== 0) {
      return res.status(200).send({ msg: "roles", data: result });
    } else {
      return res.status(400).send({ msg: "Roles Not Found" });
    }
  })
);

roleRouter.post(
  "/roleDetails",
  expressAsyncHandler(async (req, res) => {
    const { roleId } = req.body;
    if (!roleId) {
      return res.status(400).send({ msg: "Fields Missing" });
    }
    const result = await roleServices.getRoleByID(roleId);
    if (result) {
      return res.status(200).send({ msg: "Roles", data: result });
    } else {
      return res.status(400).send({ msg: "Role not found" });
    }
  })
);
roleRouter.post(
  "/",
  expressAsyncHandler(async (req, res) => {
    const { permissionsId, name, description } = req.body;
    if (!name || !description || !permissionsId) {
      return res.status(400).send({ msg: "Fields Missing" });
    }
    const result = await roleServices.addNew(permissionsId, name, description);
    if (result) {
      return res.status(200).send({ msg: "Role added.", data: result });
    } else {
      return res.status(400).send({ msg: "Role not added" });
    }
  })
);
roleRouter.patch(
  "/",
  expressAsyncHandler(async (req, res) => {
    const { roleId, permissionsId, name, description } = req.body;
    if (!roleId || !name || !description || !permissionsId) {
      return res.status(400).send({ msg: "Fields Missing" });
    }
    const result = await roleServices.update(
      roleId,
      permissionsId,
      name,
      description
    );
    if (result) {
      return res.status(200).send({ msg: "Role updated.", data: result });
    } else {
      return res.status(400).send({ msg: "Role not updated" });
    }
  })
);
roleRouter.delete(
  "/",
  expressAsyncHandler(async (req, res) => {
    const { roleId } = req.body;
    if (!roleId) {
      return res.status(400).send({ msg: "Fields Missing" });
    }
    const result = await roleServices.delete(roleId);
    if (result.deletedCount == 0) {
      return res.status(400).send({ msg: "ID Not found" });
    }
    if (result) {
      return res.status(200).send({ msg: "Role deleted.", data: result });
    } else {
      return res.status(400).send({ msg: "Role not deleted" });
    }
  })
);

module.exports = roleRouter;
