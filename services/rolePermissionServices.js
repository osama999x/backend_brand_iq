const rolePermissionModel = require("../model/rolePermissionModel");
const mongoose = require("mongoose");
const projection = require("../config/mongoProjection");


const rolePermissionServices = {
    get: async () => {
        const result = await rolePermissionModel
            .find()
            .populate({
                path: 'role',
                model: 'Role',
                select: 'name ',
            })
            .populate({
                path: 'modules.module',
                model: 'Module',
                select: 'label route  ',
            })
            .populate({
                path: 'modules.subModules.subModule',
                model: 'SubModule',
                select: 'label route'
            })
            .populate({
                path: 'modules.subModules.permissions',
                model: 'Permission',
                select: '_id name'
            })
            .populate({
                path: 'modules.permissions',
                model: 'Permission',
                select: 'name',
            }).sort({ role: 1 });

        return result;

    },

    getById: async (_id) => {
        const role_permission = await rolePermissionModel.findById({ _id }).populate({
            path: 'role',
            model: 'Role',
            select: 'name ',
        })
            .populate({
                path: 'modules.module',
                model: 'Module',
                select: 'label route  ',
            })
            .populate({
                path: 'modules.subModules.subModule',
                model: 'SubModule',
                select: '-_id label route'
            }).populate({
                path: 'modules.subModules.permissions',
                model: 'Permission',
                select: '_id name'
            })
            .populate({
                path: 'modules.permissions',
                model: 'Permission',
                select: 'name',
            });

        return role_permission;
    },
    addNew: async (role, history, modules) => {
        try {
            // Convert modules array to an array of ObjectId
            const updatedModules = modules.map(module => ({
                module: mongoose.Types.ObjectId(module.module),
                isSubmodule: module.isSubmodule,
                permissions: module.permissions.map(permission => mongoose.Types.ObjectId(permission)),
                subModules: (module.subModules || []).map(subModule => ({
                    subModule: mongoose.Types.ObjectId(subModule.subModule),
                    permissions: (subModule.permissions || []).map(subPermission => mongoose.Types.ObjectId(subPermission)),
                })),
            }));

            const updatedPermission = await rolePermissionModel.findOneAndUpdate(
                { role: mongoose.Types.ObjectId(role) },
                { $set: { history: history, modules: updatedModules } },
                { upsert: true, new: true }
            );

            return updatedPermission;
        } catch (error) {
            console.error("Error in addNew:", error);
            throw error;
        }
    }






    ,
    getRolePermissions: async (roleId) => {
        const rolePermission = await rolePermissionModel.findOneAndDelete({ role: roleId });
        return rolePermission;
    }
    ,
    getByRole: async (roleId) => {
        const roleDetails = await rolePermissionModel
            .findOne(
                { role: { $in: roleId } },
                {
                    createdAt: 0,
                    updatedAt: 0,
                    __v: 0,
                    "modules.isSubmodule": 0,
                    "modules._id": 0,
                    "modules.module._id": 0,
                    "modules.permission._id": 0,
                    "modules.subModules._id": 0,
                    "modules.subModules.subModule._id": 0,
                    "modules.subModules.permission._id": 0,
                }
            )
            .populate({
                path: "role",
                select: {
                    _id: 0,
                    createdAt: 0,
                    updatedAt: 0,
                    __v: 0,
                },
            })
            .populate({
                path: "modules.module",
                select: {
                    // _id: 0,
                    createdAt: 0,
                    updatedAt: 0,
                    __v: 0,
                    permissions: 0,
                },
                // options:{sort:{orderPosition:1}}
            })
            .populate({
                path: "modules.permissions",
                select: {
                    // _id: 0,
                    createdAt: 0,
                    updatedAt: 0,
                    __v: 0,
                },
            })
            .populate({
                path: "modules.subModules.subModule",
                select: {
                    // _id: 0,
                    createdAt: 0,
                    updatedAt: 0,
                    __v: 0,
                    permissions: 0,
                    isSubmodule: 0,
                    module: 0,
                },
            })
            .populate({
                path: "modules.subModules.permissions",
                select: {
                    // _id: 0,
                    createdAt: 0,
                    updatedAt: 0,
                    __v: 0,
                },
            });
        if (roleDetails)
            roleDetails.modules = result?.modules?.filter((item) => {
                return item.permissions.length || item.subModules.length
            })
        return roleDetails;
    },
    getRolePermission: async (roleId) => {
        const roleDetails = await rolePermissionModel
            .findOne(
                { role: { $in: roleId } },
                {
                    role: 0,
                    history: 0,
                    _id: 0,
                    createdAt: 0,
                    updatedAt: 0,
                    __v: 0,
                    "modules.isSubmodule": 0,
                    "modules._id": 0,
                    "modules.module._id": 0,
                    "modules.permission._id": 0,
                    "modules.sub_Modules._id": 0,
                    "modules.subModules.subModule._id": 0,
                    "modules.subModules.permission._id": 0,
                }
            )
            .populate({
                path: "modules.module",
                select: {
                    _id: 0,
                    createdAt: 0,
                    updatedAt: 0,
                    __v: 0,
                    permissions: 0,
                },
            })
            .populate({
                path: "modules.permissions",
                select: {
                    _id: 0,
                    createdAt: 0,
                    updatedAt: 0,
                    __v: 0,
                },
            })
            .populate({
                path: "modules.subModules.subModule",
                select: {
                    _id: 0,
                    createdAt: 0,
                    updatedAt: 0,
                    __v: 0,
                    permissions: 0,
                    isSubmodule: 0,
                    module: 0,
                },
            })
            .populate({
                path: "modules.subModules.permissions",
                select: {
                    _id: 0,
                    createdAt: 0,
                    updatedAt: 0,
                    __v: 0,
                },
            });
        return roleDetails;
    },
    update: async (_id, role, history, modules, isSubmodule) => {
        var _id = mongoose.Types.ObjectId(_id);
        const result = await rolePermissionModel.findOneAndUpdate(
            { _id },
            { role, history, modules, isSubmodule },
            { new: true }
        );
        return result;
    },
    assignNewPermission: async (
        _id,
        module,
        isSubmodule,
        subModule,
        permission,
    ) => {
        const result = await rolePermissionModel.findOneAndUpdate(
            { _id },
            {
                $addToSet: {
                    "modules.module": module,
                },
                $push: {
                    "modules.isSubmodule": isSubmodule,
                    "modules.permissions": permission,
                    "modules.sub_modules.subModule": subModule,
                    "modules.sub_modules.permissions": permission
                },
            },
            { new: true }
        );
        return result;
    },
    delete: async (_id) => {
        //const filter = { _id: _id };
        var _id = mongoose.Types.ObjectId(_id);
        const result = await rolePermissionModel.deleteOne({ _id });
        return result;
    },
};

module.exports = rolePermissionServices;
