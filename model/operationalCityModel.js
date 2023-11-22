const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const schema = new Schema(
  {
    operationalCities: [Object],
    courier: String,
  },
  { timestamps: true }
);
const operationalCityModel = new mongoose.model("OperationalCities", schema);
module.exports = operationalCityModel;
