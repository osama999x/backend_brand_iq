const mongoose = require("mongoose");

const { Schema } = mongoose;

const ctaSchema = new Schema(
    {
        text: { type: String, default: "" },
        href: { type: String, default: "" },
    },
    { _id: false }
);

const themeSchema = new Schema(
    {
        overlayColor: { type: String, default: "#000000" },
        overlayOpacity: { type: Number, min: 0, max: 1, default: 0.35 },
        textColor: { type: String, default: "#ffffff" },
    },
    { _id: false }
);

const announcementSchema = new Schema(
    {
        enabled: { type: Boolean, default: true },
        messages: [{ type: String, trim: true, default: "" }],
    },
    { _id: false }
);

const schema = new Schema(
    {
        gender: {
            type: String,
            enum: ["men", "women", "juniors", "unisex"],
            default: "unisex",
            index: true,
        },
        video: { type: String, default: "" }, // stored as "videos/<file>"
        poster: { type: String, default: "" }, // optional "images/<file>"
        labels: [{ type: String, trim: true, default: "" }],
        headline: { type: String, default: "" },
        subheadline: { type: String, default: "" },
        cta: { type: ctaSchema, default: () => ({}) },
        theme: { type: themeSchema, default: () => ({}) },
        announcement: { type: announcementSchema, default: () => ({}) },
        sortOrder: { type: Number, default: 0 },
        isActive: { type: Boolean, default: true, index: true },
    },
    { timestamps: true }
);

schema.index({ gender: 1, isActive: 1, sortOrder: 1 });

const HomeHeroModel = mongoose.model("HomeHero", schema);

module.exports = HomeHeroModel;

