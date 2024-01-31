const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const uuid = require("uuid");


const schema = new Schema(
    {
        Reigon: {
            type: String,
            required: true,
            unique: true,
        },
        deliveryCharges: {
            type: Number,
            default: 0,
            required: true,
        }
    },
    { timestamps: true }
);

const DeliveryChargesModel = new mongoose.model("DeliveryCharges", schema);
module.exports = DeliveryChargesModel;
