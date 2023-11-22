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
    variant: [
      {
        colorName: { type: String, default: "" },
        colorHex: { type: String, default: "" },
        actualPrice: { type: Number, required: true, min: 0, default: 0 },
        discountedPrice: { type: Number, min: 0, default: 0 },
        quantity: { type: Number, required: true, min: 0, default: 0 },
        sku: { type: String, required: true, unique: true },
        size: { type: String, default: "" },
        image: { type: String },
      },
    ],
    thumbnail: {
      type: String,
    },
    images: [String],
    vendor: {
      type: String,
      required: true,
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
    isDiscount: {
      type: Boolean,
      default: false,
      required: true,
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
