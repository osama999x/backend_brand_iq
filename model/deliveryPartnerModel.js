const { truncate } = require("fs");
const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const uuid = require("uuid");
const schema = new Schema(
  {
    organization: {
      organizationName: {
        type: String,
        required: true,
        unique: true,
      },
      city: {
        type: String,
        required: true,
      },
      mailingAdress: {
        type: String,
        required: true,
      },
      contactNumber: {
        type: Number,
        required: true,
      },
      website: {
        type: String,
        required: true,
      },
      orderTrackingLink: {
        type: String,
        required: true,
      },
    },
    organizationHead: {
      name: {
        type: String,
        required: true,
      },
      fatherName: {
        type: String,
        required: true,
      },
      cnic: {
        type: String,
        required: true,
      },
      contactNumber: {
        type: String,
        required: true,
      },
      image: {
        type: String,
        required: true,
      },
    },
    organizationRepresentative: {
      name: {
        type: String,
        required: true,
      },
      fatherName: {
        type: String,
        required: true,
      },
      cnic: {
        type: String,
        required: true,
      },
      contactNumber: {
        type: String,
        required: true,
      },
      image: {
        type: String,
        required: true,
      },
    },
  },
  { timestamps: true }
);

const deliveryPartnerModel = new mongoose.model("deliveryPartner", schema);
module.exports = deliveryPartnerModel;
