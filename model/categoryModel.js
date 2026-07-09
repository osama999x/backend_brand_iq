const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const schema = new Schema(
    {
        name: {
            type: String,
            required: true,
            unique: true,
        },
        icon: {
            type: String,
            required: true,
        },
        thumbnail: {
            type: String,
            required: true,
            default: "",
        },
        description: {
            type: String,
        },
        isFeatured: {
            type: Boolean,
            default: true,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        gender: {
            type: String,
            enum: ["men", "women", "juniors", "unisex", "cosmetics"],
            default: "unisex",
        },
    },
    { timestamps: true }
);

const categoryModel = new mongoose.model("Category", schema);
module.exports = categoryModel;
