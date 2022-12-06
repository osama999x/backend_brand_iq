const deliveryPartnerModel = require("../model/deliveryPartnerModel");
const projection = require("../config/mongoProjection");
const mongoose = require("mongoose");
// const productsImagesModel = require("../model/productsImagesModel");

const deliveryPartnerServices = {
  get: async () => {
    const result = await deliveryPartnerModel.find({}, projection.projection);
    return result;
  },
  getDeliveryPartnerList: async () => {
    var result = await deliveryPartnerModel
      .find({}, { "organization.organizationName": 1 })
      .lean();
    if (result.length != 0) {
      result = result.map((item) => {
        item.organizationName = item.organization.organizationName;
        delete item.organization;
        return item;
      });
    }
    return result;
  },
  addNew: async (
    organization,
    organizationHead,
    organizationRepresentative
  ) => {
    const data = new deliveryPartnerModel({
      organization,
      organizationHead,
      organizationRepresentative,
    });
    const result = await data.save();
    return result;
  },
  update: async (
    _id,
    organization,
    organizationHead,
    organizationRepresentative
  ) => {
    var _id = mongoose.Types.ObjectId(_id);
    result = await deliveryPartnerModel.findOneAndUpdate(
      { _id },
      {
        organization,
        organizationHead,
        organizationRepresentative,
      },
      {
        new: true,
      }
    );
    return result;
  },
  delete: async (_id) => {
    var _id = mongoose.Types.ObjectId(_id);
    let result = await deliveryPartnerModel.deleteOne({ _id });
    return result;
  },
};

module.exports = deliveryPartnerServices;
