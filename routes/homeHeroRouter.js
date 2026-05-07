const express = require("express");
const expressAsyncHandler = require("express-async-handler");
const homeHeroServices = require("../services/homeHeroServices");

const homeHeroRouter = express.Router();

const GENDER_VALUES = ["men", "women", "juniors", "unisex"];

homeHeroRouter.get(
    "/all",
    expressAsyncHandler(async (req, res) => {
        const data = await homeHeroServices.getAll();
        res.status(200).json({ msg: "Home Hero", data });
    })
);

homeHeroRouter.get(
    "/active",
    expressAsyncHandler(async (req, res) => {
        const { gender } = req.query;
        if (gender && !GENDER_VALUES.includes(gender)) {
            return res.status(400).json({ msg: `gender must be one of: ${GENDER_VALUES.join(", ")}` });
        }
        const data = await homeHeroServices.getActive(gender);
        res.status(200).json({ msg: "Home Hero", data });
    })
);

homeHeroRouter.post(
    "/",
    expressAsyncHandler(async (req, res) => {
        const payload = req.body || {};
        if (payload.gender && !GENDER_VALUES.includes(payload.gender)) {
            return res.status(400).json({ msg: `gender must be one of: ${GENDER_VALUES.join(", ")}` });
        }
        const result = await homeHeroServices.add(payload);
        res.status(200).json({ msg: "Home Hero Added", data: result });
    })
);

homeHeroRouter.patch(
    "/",
    expressAsyncHandler(async (req, res) => {
        const { heroId, ...patch } = req.body || {};
        if (!heroId) return res.status(400).json({ msg: "heroId is required" });
        if (patch.gender && !GENDER_VALUES.includes(patch.gender)) {
            return res.status(400).json({ msg: `gender must be one of: ${GENDER_VALUES.join(", ")}` });
        }
        const result = await homeHeroServices.update(heroId, patch);
        res.status(200).json({ msg: "Home Hero Updated", data: result });
    })
);

homeHeroRouter.delete(
    "/",
    expressAsyncHandler(async (req, res) => {
        const { heroId } = req.query;
        if (!heroId) return res.status(400).json({ msg: "heroId is required" });
        const result = await homeHeroServices.remove(heroId);
        res.status(200).json({ msg: "Home Hero Deleted", data: result });
    })
);

module.exports = homeHeroRouter;

