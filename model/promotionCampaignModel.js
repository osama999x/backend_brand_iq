const { truncate } = require("fs/promises");
const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const uuid = require("uuid");
const schema = new Schema(
  {
    campaignName: {
      type: String,
      required: true,
      unique: true,
    },
    description: {
      type: String,
    },
    banner: {
      type: String,
      required: true,
    },
    activeFrom: {
      type: Date,
      required: true,
    },
    activeTo: {
      type: Date,
      required: true,
    },
  },
  { timestamps: true }
);

const promotionCampaignModel = new mongoose.model("Campaign", schema);
module.exports = promotionCampaignModel;
