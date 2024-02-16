const deliveryModel = require('../model/DeliveryCharges');
const mongoose = require("mongoose");
const deliveryServices = {
    addDeliveryCharge: async (Region, Charges) => {
        let deliveryChargess = new deliveryModel({
            Region: Region,
            deliveryCharges: Charges
        })
        const result = await deliveryChargess.save();
        return result;

    },
    getAll: async () => {
        const allData = await deliveryModel.find().populate({ path: 'Region', model: 'TaxType', select: 'taxType' });
        return allData;
    },
    getById: async (id) => {
        const idfound = await deliveryModel.find({ _id: id })
        if (idfound.length > 0) {
            return idfound[0];
        }
    },
    update: async (id, Region, deliveryCharges) => {
        var _id = mongoose.Types.ObjectId(id);
        const result = await deliveryModel.findOneAndUpdate(
            { _id },
            { Region, deliveryCharges },
            { new: true }
        );
        return result;
    }, delete: async (_id) => {
        var _id = mongoose.Types.ObjectId(_id);
        const result = await deliveryModel.deleteOne({ _id });
        return result;
    }
}

module.exports = deliveryServices;

