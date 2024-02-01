const pointManageModel = require("../model/pointManageModel");
const mongoose = require("mongoose");
const projection = require("../config/mongoProjection");

const pointManageServices = {
    get: async () => {
        const result = await pointManageModel.find({}, projection.projection);
        return result;
    },
    getOne: async (_id) => {
        const result = await pointManageModel.findById(
            { _id },
            projection.projection
        );
        return result;
    },
    addNew: async (initialPoint, pointOrderPriceTo, pointOrderPriceFrom, pointPerOrder, ReedemPoints) => {
        const permission = new pointManageModel({
            initialPoint,
            pointOrderPriceTo,
            pointOrderPriceFrom,
            pointPerOrder,
            ReedemPoints
        });
        const result = await permission.save();
        return result;
    },
    update: async (_id, initialPoint, pointOrderPriceTo, pointOrderPriceFrom, pointPerOrder, ReedemPoints) => {
        var _id = mongoose.Types.ObjectId(_id);

        if (initialPoint) {
            const result = await pointManageModel.updateMany(
                {},
                { initialPoint: initialPoint },
                { upsert: true }
            );
            return result;
        } else {
            const result = await pointManageModel.findOneAndUpdate(
                { _id },
                { pointOrderPriceTo, pointOrderPriceFrom, pointPerOrder, ReedemPoints },
                { new: true }
            );

            return result;
        }
    }
    ,
    delete: async (_id) => {
        //const filter = { _id: _id };
        var _id = mongoose.Types.ObjectId(_id);
        const result = await pointManageModel.deleteOne({ _id });
        return result;
    },
};

module.exports = pointManageServices;
