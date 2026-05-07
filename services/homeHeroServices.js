const mongoose = require("mongoose");
const HomeHeroModel = require("../model/homeHeroModel");
const projection = require("../config/mongoProjection");
const uploadFile = require("../utils/uploadFile");

const normalizeLabels = (labels) => {
    if (!labels) return [];
    if (Array.isArray(labels)) {
        return labels
            .map((x) => (x == null ? "" : String(x).trim()))
            .filter(Boolean);
    }
    if (typeof labels === "string") {
        return labels
            .split(",")
            .map((x) => x.trim())
            .filter(Boolean);
    }
    return [];
};

const normalizeMessages = (messages) => {
    if (!messages) return [];
    if (Array.isArray(messages)) {
        return messages
            .map((x) => (x == null ? "" : String(x).trim()))
            .filter(Boolean);
    }
    if (typeof messages === "string") {
        return messages
            .split("|")
            .map((x) => x.trim())
            .filter(Boolean);
    }
    return [];
};

const homeHeroServices = {
    getAll: async () => {
        return HomeHeroModel.find({}, projection.projection).sort({ gender: 1, sortOrder: 1, createdAt: -1 });
    },

    getActive: async (gender) => {
        if (gender) {
            const specific = await HomeHeroModel.findOne({ isActive: true, gender }).sort({ sortOrder: 1, createdAt: -1 }).lean();
            if (specific) return specific;
        }
        return HomeHeroModel.findOne({ isActive: true, gender: "unisex" }).sort({ sortOrder: 1, createdAt: -1 }).lean();
    },

    add: async ({
        gender = "unisex",
        video,
        poster,
        labels,
        headline,
        subheadline,
        cta,
        theme,
        announcement,
        sortOrder = 0,
        isActive = true,
    }) => {
        let uploadedVideo = video;
        let uploadedPoster = poster;

        if (video && typeof video === "string" && video.startsWith("data:")) {
            uploadedVideo = await uploadFile(video);
        }
        if (poster && typeof poster === "string" && poster.startsWith("data:")) {
            uploadedPoster = await uploadFile(poster);
        }

        if (isActive === true) {
            await HomeHeroModel.updateMany({ gender, isActive: true }, { $set: { isActive: false } });
        }

        const doc = new HomeHeroModel({
            gender,
            video: uploadedVideo || "",
            poster: uploadedPoster || "",
            labels: normalizeLabels(labels),
            headline: headline || "",
            subheadline: subheadline || "",
            cta: cta || {},
            theme: theme || {},
            announcement: announcement
                ? {
                    enabled: announcement.enabled !== false,
                    messages: normalizeMessages(announcement.messages),
                }
                : {},
            sortOrder: Number(sortOrder) || 0,
            isActive: Boolean(isActive),
        });

        return doc.save();
    },

    update: async (heroId, patch = {}) => {
        const _id = new mongoose.Types.ObjectId(heroId);

        const update = { ...patch };
        if (update.labels !== undefined) update.labels = normalizeLabels(update.labels);
        if (update.announcement) {
            update.announcement = {
                enabled: update.announcement.enabled !== false,
                messages: normalizeMessages(update.announcement.messages),
            };
        }

        if (update.video && typeof update.video === "string" && update.video.startsWith("data:")) {
            update.video = await uploadFile(update.video);
        }
        if (update.poster && typeof update.poster === "string" && update.poster.startsWith("data:")) {
            update.poster = await uploadFile(update.poster);
        }

        if (update.isActive === true) {
            const current = await HomeHeroModel.findById(_id, { gender: 1 }).lean();
            const gender = (update.gender || (current && current.gender)) || "unisex";
            await HomeHeroModel.updateMany({ _id: { $ne: _id }, gender, isActive: true }, { $set: { isActive: false } });
        }

        return HomeHeroModel.findOneAndUpdate({ _id }, update, { new: true });
    },

    remove: async (heroId) => {
        const _id = new mongoose.Types.ObjectId(heroId);
        return HomeHeroModel.deleteOne({ _id });
    },
};

module.exports = homeHeroServices;

