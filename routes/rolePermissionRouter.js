const express = require("express");
const expressAsyncHandler = require("express-async-handler");
const rolePermissionServices = require("../services/rolePermissionServices");
const rolePermissionRouter = express.Router();

rolePermissionRouter.get(
    "/all",
    expressAsyncHandler(async (req, res) => {
        const result = await rolePermissionServices.get();
        res.status(200).send({ msg: "Role Permissions", data: result });
    })
);
rolePermissionRouter.get(
    "/getById",
    expressAsyncHandler(async (req, res) => {
        const { role_permissionId } = req.query;
        const result = await rolePermissionServices.getById(role_permissionId);
        if (result) {
            res.status(200).send({ msg: "Role Permissions", data: result });
        } else {
            res.status(400).send({ msg: "Role Permissions", data: result });
        }
    })
);
rolePermissionRouter.get(
    "/getByRole",
    expressAsyncHandler(async (req, res) => {
        const { roleId } = req.query;
        const result = await rolePermissionServices.getByRole(roleId);
        if (result) {
            res.status(200).send({ msg: "Role Permissions", data: result });
        } else {
            res.status(400).send({ msg: "Role Permissions", data: result });
        }
    })
);
rolePermissionRouter.post(
    "/",
    expressAsyncHandler(async (req, res) => {
        try {
            const { role, history, modules } = req.body;
            if (!role || modules.length === 0) {
                return res.status(400).send({ msg: "Fields Missing" });
            }

            const result = await rolePermissionServices.addNew(role, history, modules);

            if (result) {
                return res.status(201).send({ msg: "Role permission Added.", data: result });
            } else {
                return res.status(400).send({ msg: "Role permission not Added" });
            }
        } catch (error) {
            console.error("Error in adding role permission:", error);
            return res.status(500).send({ msg: "Internal Server Error" });
        }
    })
);

rolePermissionRouter.patch(
    "/",
    expressAsyncHandler(async (req, res) => {
        const { role_permissionId, role, history, modules, isSubmodule } = req.body;
        const result = await rolePermissionServices.update(
            role_permissionId,
            role,
            history,
            modules,
            isSubmodule
        );
        if (result) {
            return res
                .status(200)
                .send({ msg: "Role permission Updated.", data: result });
        } else {
            return res.status(400).send({ msg: "Role permission not updated" });
        }
    })
);
rolePermissionRouter.patch(
    "/assignNewPermission",
    expressAsyncHandler(async (req, res) => {
        const { role_permissionId, module, isSubmodule, subModule, permission } =
            req.body;
        const result = await rolePermissionServices.assignNewPermission(
            role_permissionId,
            module,
            isSubmodule,
            subModule,
            permission
        );
        if (result) {
            return res
                .status(200)
                .send({ msg: "Role permission updated.", data: result });
        } else {
            return res.status(400).send({ msg: "Role permission not updated" });
        }
    })
);
rolePermissionRouter.delete(
    "/",
    expressAsyncHandler(async (req, res) => {
        const { role_permissionId } = req.body;
        const result = await rolePermissionServices.delete(role_permissionId);
        if (result.deletedCount == 0) {
            return res.status(400).send({ msg: "ID Not found" });
        }
        if (result) {
            return res
                .status(200)
                .send({ msg: "Role permission deleted.", data: result });
        } else {
            return res.status(400).send({ msg: "Role permission not deleted" });
        }
    })
);

module.exports = rolePermissionRouter;
