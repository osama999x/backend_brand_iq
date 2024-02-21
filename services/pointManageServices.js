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
            const result1 = await pointManageModel.updateMany(
                {},
                { initialPoint: initialPoint },
                { upsert: true }
            );

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
    check: async (price, pointsCheck) => {
        const getPointPerOrder = await pointManageModel.findOne({
            pointOrderPriceTo: { $lte: price },
            pointOrderPriceFrom: { $gte: price }
        });

        if (getPointPerOrder) {
            const { ReedemPoints, pointOrderPriceTo, pointOrderPriceFrom } = getPointPerOrder;

            if (ReedemPoints >= pointsCheck) {
                return {
                    success: true,
                    message: "Price falls within the specified range.",
                    pointOrderPriceTo,
                    pointOrderPriceFrom,
                    MaximumPointsToReedem: ReedemPoints
                };
            } else {
                return {
                    success: false,
                    message: "Points check failed. ReedemPoints is greater than pointsCheck.",
                    pointOrderPriceTo,
                    pointOrderPriceFrom,
                    MaximumPointsToReedem: ReedemPoints
                };
            }
        } else {
            return {
                success: false,
                message: "No matching document found for the given price range."
            };
        }
    }
}

module.exports = pointManageServices;
