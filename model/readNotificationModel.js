const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const schema = new Schema(
  {
    customer: {
      type: Schema.Types.ObjectId,
      ref: "Customer",
    },
    readNotification: [Schema.Types.ObjectId],
  },
  { timestamps: true }
);
const readNotficationModel = new mongoose.model("readNotfication", schema);
module.exports = readNotficationModel;
