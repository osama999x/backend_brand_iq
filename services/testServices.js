const projection = require("../config/mongoProjection");
const mongoose = require("mongoose");
const testModel = require("../model/testModel");
const reader = require("xlsx");

const testServices = {
  get: async () => {
    const list = await testModel.find({}, projection.projection);
    return list;
  },

  addNew: async (file) => {
    const sheets = file.SheetNames;
    let data = [];
    for (let i = 0; i < sheets.length; i++) {
      let temp = reader.utils.sheet_to_json(file.Sheets[file.SheetNames[i]]);
      console.log(temp[0].Name);
      temp.map((item) => {
        //console.log(item);
        return;
        data.push(item);
      });
    }
    const result = await testModel.insertMany(data);
    return result;
  },
};

module.exports = testServices;
