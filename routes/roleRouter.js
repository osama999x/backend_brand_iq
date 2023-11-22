const express = require("express");
const expressAsyncHandler = require("express-async-handler");
const rolePermissionServices = require("../services/rolePermissionServices");
const roleServices = require("../services/roleServices");
const userServices = require("../services/userServices");
const roleRouter = express.Router();

roleRouter.get(
  "/all",
  expressAsyncHandler(async (req, res) => {
    const result = await roleServices.get();
    res.status(200).send({ msg: "roles", data: result });
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
    const { name, description } = req.body;
    if (!name || !description) {
      return res.status(400).send({ msg: "Fields Missing" });
    }
    const result = await roleServices.addNew(name, description);
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
    const { roleId, name, description } = req.body;
    if (!roleId || !name || !description) {
      return res.status(400).send({ msg: "Fields Missing" });
    }
    const result = await roleServices.update(roleId, name, description);
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
    const user_role = await roleServices.getUserRole(roleId);
    const role_permission = await rolePermissionServices.getRolePermissions(
      roleId
    );
    if (role_permission.length !== 0 || user_role.length !== 0) {
      return res.status(400).send({
        msg: "This role cannot be deleted because it has been assigned to one or more users",
      });
    }
    const result = await roleServices.delete(roleId);
    if (result.deletedCount === 0) {
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
