const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const schema = new Schema(
  {
    role: {
      type: Schema.Types.ObjectId,
      ref: "Role",
      unique:true
    },
    history: {
      type: String,
    },
    modules: [
      {
        module: {
          type: Schema.Types.ObjectId,
          ref: "Module",
        },
        isSubmodule: { type: Boolean, default: false },
        permissions: [{ type: Schema.Types.ObjectId, ref: "Permission" }],
        sub_Modules: [
          {
            subModule: { type: Schema.Types.ObjectId, ref: "SubModule" },
            permissions: [{ type: Schema.Types.ObjectId, ref: "Permission" }],
          },
        ],
      },
    ],
  },
  { timestamps: true }
);
const rolePermissionModel = new mongoose.model("RolePermission", schema);
module.exports = rolePermissionModel;
