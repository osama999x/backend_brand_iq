var mongoose = require("mongoose");

var empSchema = new mongoose.Schema({
  product: [
    {
      productId: {
        type: String,
      },
      name: {
        type: String,
      },
    },
  ],
  Email: {
    type: String,
  },
  Designation: {
    type: String,
  },
  Mobile: {
    type: Number,
  },
});

const testModel = mongoose.model("Test", empSchema);
module.exports = testModel;
