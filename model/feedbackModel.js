const mongoose = require("mongoose");
const { isValidPassword } = require("mongoose-custom-validators");
const Schema = mongoose.Schema;
const schema = new Schema(
  {
    customerId: {
      type: Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
    },
    channel: {
      type: Number,
      min: 0,
      max: 1,
      required: true,
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
    },
    comments: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

const feedbackModel = new mongoose.model("FeedBack", schema);
module.exports = feedbackModel;
