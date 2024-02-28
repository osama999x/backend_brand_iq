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
        res.status(200).send({ msg: "Roles", data: result });
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
            return res.status(400).send({ msg: "Role not Found" });
        }
    })
);
roleRouter.post(
    "/",
    expressAsyncHandler(async (req, res) => {
        const { name, description } = req.body;
        if (!name) {
            return res.status(400).send({ msg: "Fields Missing" });
        }
        const result = await roleServices.addNew(name, description);
        if (result) {
            return res.status(200).send({ msg: "Role Added.", data: result });
        } else {
            return res.status(400).send({ msg: "Role not Added" });
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
            return res.status(200).send({ msg: "Role Updated.", data: result });
        } else {
            return res.status(400).send({ msg: "Role not Updated" });
        }
    })
);
roleRouter.delete(
    "/",
    expressAsyncHandler(async (req, res) => {
        const { roleId } = req.body;
        const user_role = await roleServices.getUserRole(roleId);
        if (user_role.length !== 0) {
            return res.status(400).send({
                msg: "Role is Assigned to a User.",
            });
        }
        const role_permissionDelete = await rolePermissionServices.getRolePermissions(
            roleId
        );
        const result = await roleServices.delete(roleId);
        if (result.deletedCount === 0) {
            return res.status(400).send({ msg: "ID Not Found." });
        }
        if (result) {
            return res.status(200).send({ msg: "Role Deleted.", data: result });
        } else {
            return res.status(400).send({ msg: "Role not Deleted" });
        }
    })
);

module.exports = roleRouter;
