const mongoose = require("mongoose");
const { isValidPassword } = require("mongoose-custom-validators");
const Schema = mongoose.Schema;
const schema = new Schema(
  {
    customerId: {
      type: Schema.Types.ObjectId,
      ref: "Customer",
      default: null,
    },
    customerEmail: {
      type: String,
      trim: true,
      lowercase: true,
      default: "",
    },
    channel: {
      type: String,
      default: "",
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

// Ensure one feedback per identified customer (either by customerId or by email for guests)
schema.index({ customerId: 1 }, { unique: true, sparse: true });
schema.index({ customerEmail: 1 }, { unique: true, sparse: true });

const feedbackModel = new mongoose.model("FeedBack", schema);
module.exports = feedbackModel;
