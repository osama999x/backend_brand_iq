const mongoose = require("mongoose");
const { FLOAT } = require("sequelize");
const Schema = mongoose.Schema;
const uuid = require("uuid");
const schema = new Schema(
    {
        category: {
            type: Schema.Types.ObjectId,
            ref: "Category",
            required: true,
        },
        subcategory: {
            type: Schema.Types.ObjectId,
            ref: "SubCategory",
            required: true,
        },
        name: {
            type: String,
        },
        title: {
            type: String,
            required: true,
        },
        description: {
            type: String,
            required: true,
        },
        longDescription: {
            type: String,
            required: true,
            default: "",
        },
        sizeGuide: {
            type: String,
            default: "",
        },
        sizeFit: {
            type: String,
            default: "",
        },
        deliveryReturns: {
            type: String,
            default: "",
        },
        variant: [
            {
                colorName: { type: String, default: "", trim: true },
                colorHex: { type: String, default: "" },
                // Flat price/quantity kept for backward compatibility with older records.
                // For products using per-size pricing, leave these at 0 and use the size array instead.
                actualPrice: { type: Number, min: 0, default: 0 },
                discountedPrice: { type: Number, min: 0, default: 0 },
                quantity: { type: Number, min: 0, default: 0 },
                sku: { type: String, required: true, unique: true },
                // Each entry represents one size with its own stock and price.
                size: [
                    {
                        name: { type: String, default: "", trim: true },
                        actualPrice: { type: Number, min: 0, default: 0 },
                        discountedPrice: { type: Number, min: 0, default: 0 },
                        quantity: { type: Number, min: 0, default: 0 },
                    },
                ],
                image: { type: String },
                isDiscount: { type: Boolean, default: false, required: true },
            },
        ],
        thumbnail: {
            type: String,
        },
        images: [String],
        vendor: {
            type: String,
            default: "",
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        isFeatured: {
            type: Boolean,
            default: true,
        },
        isSale: {
            type: Boolean,
            default: false,
        },
        isDeal: {
            type: Boolean,
            default: false,
            required: true,
        },
        isDiscount: {
            type: Boolean,
            default: false,
        },
        dealExpire: {
            type: Date,
        },
        discount: {
            type: Number,
            default: 0,
            min: 0,
        },
        oneTimeDeal: {
            type: Boolean,
            default: true,
        },

        inStock: {
            type: Boolean,
            default: true,
        },
        sequence: {
            type: Number,
            default: 0,
        },
        ratingCount: {
            type: Number,
            default: 0,
        },
        ratingNumber: {
            type: Number,
            default: 0,
        },
        isFavourite: {
            type: Boolean,
            default: false,
        },
        isTaxable: {
            type: Boolean,
            default: false,
        },
        taxHead: {
            type: Schema.Types.ObjectId,
            ref: "TaxHead",
            default: null,
        },
        taxType: {
            type: Schema.Types.ObjectId,
            ref: "TaxType",
            default: null,
        },
        isPercentage: {
            type: Boolean,
            default: false,
        },
        taxAmount: {
            type: Number,
            default: 0,
        },
        metaData: { type: String },
        metaDescription: { type: String },
        tags: {
            type: String,
        },

        promotionDiscount:
        {
            type: String
        },
        addons: [
            {
                product: {
                    type: Schema.Types.ObjectId,
                    ref: "Product",
                    default: "",
                },
                sku: {
                    type: String,
                    default: "",
                },
            },
        ],
    },
    { timestamps: true }
);
// Create a compound text index for search
schema.index({
    name: "text",
    title: "text",
    description: "text",
    tags: "text"
});
schema.index({ "variant.sku": 1 }, { unique: true });
// Pre-save hook to check uniqueness of `sku` within `variant` array
schema.pre("save", async function (next) {
    const existingProducts = await this.constructor.find({
        "variant.sku": this.variant.sku,
        _id: { $ne: this._id },
    });

    if (existingProducts.length > 0) {
        const error = new Error("Duplicate SKU found in variants");
        return next(error);
    }

    next();
});
const productsModel = new mongoose.model("Product", schema);
module.exports = productsModel;
