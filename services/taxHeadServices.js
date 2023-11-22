const projection = require("../config/mongoProjection");
const mongoose = require("mongoose");
const taxHeadModel = require("../model/taxHeadModel");

const taxHeadServices = {
  get: async () => {
    const result = taxHeadModel.find().populate({
      path: "taxType",
      select: { _id: 1, taxType: 1 },
    });
    return result;
  },
  getOne: async (_id) => {
    const resutl = await taxHeadModel
      .findById({ _id }, projection.projection)
      .populate({
        path: "taxType",
        select: { taxType: 1 },
      });
    //hello
    return resutl;
  },
  add: async (taxType, taxHead, description) => {
    taxHead = new taxHeadModel({ taxType, taxHead, description });
    const result = await taxHead.save();
    return result;
  },

  update: async (taxHeadId, taxType, taxHead, description) => {
    var _id = mongoose.Types.ObjectId(taxHeadId);
    const result = await taxHeadModel.findOneAndUpdate(
      { _id },
      { taxType, taxHead, description },
      { new: true }
    );
    return result;
  },
  delete: async (_id) => {
    var _id = mongoose.Types.ObjectId(_id);
    const result = await taxHeadModel.deleteOne({ _id });
    return result;
  },
  isExist: async (id) => {
    const result = await taxHeadModel.findOne({ taxType: id });
    return result;
  },
};

module.exports = taxHeadServices;
