const favouriteModel = require("../model/favouritesModel");
const projection = require("../config/mongoProjection");
const mongoose = require("mongoose");
const productsModel = require("../model/productsModel");
const productsServices = require("./productsServices");
const promotionModel = require("../model/promotionModel")

const favouriteServices = {
    getFavourites: async (customerId) => {
        // let list = await favouriteModel.aggregate([
        //     {
        //         $match: {
        //             customer: new mongoose.Types.ObjectId(customerId),
        //         },
        //     },
        //     {
        //         $lookup: {
        //             from: "products",
        //             localField: "product",
        //             foreignField: "_id",
        //             as: "product",
        //         },
        //     },
        //     {
        //         $unwind: {
        //             path: "$product",
        //         },
        //     },
        //     {
        //         $project: {
        //             _id: 1,
        //             customer: 1,
        //             "product._id": 1,
        //             "product.name": 1,
        //             "product.thumbnail": 1,
        //             "product.isFavourite": true,
        //             "product.variant": 1,
        //         },
        //     },
        //     {
        //         $addFields: {
        //             "product.first_variant": {
        //                 $arrayElemAt: ["$product.variant", 0],
        //             },
        //         },
        //     },
        //     {
        //         $unwind: {
        //             path: "$product.variant",
        //         },
        //     },
        //     {
        //         $project: {
        //             _id: 1,
        //             customer: 1,
        //             "product._id": 1,
        //             "product.name": 1,
        //             "product.thumbnail": 1,
        //             "product.actualPrice": "$product.variant.actualPrice",
        //             "product.discountedPrice": "$product.variant.discountedPrice"
        //         },
        //     },
        //     {
        //         $addFields: {
        //             "product.isFavourite": true,
        //         },
        //     },
        //     {
        //         $group: {
        //             _id: "$_id",
        //             customer: {
        //                 $first: "$customer",
        //             },
        //             product: {
        //                 $first: "$product",
        //             },
        //         },
        //     },
        // ]);


        let list = await favouriteModel.aggregate([
            {
                $match: {
                    customer: new mongoose.Types.ObjectId(customerId),
                },
            },
            {
                $lookup: {
                    from: "products",
                    localField: "product",
                    foreignField: "_id",
                    as: "product",
                },
            },
            {
                $unwind: {
                    path: "$product",
                },
            },
            {
                $lookup: {
                    from: "promotions",
                    localField: "product._id",
                    foreignField: "product",
                    as: "promotion",
                },
            },
            {
                $addFields: {
                    "product.promotion": { $arrayElemAt: ["$promotion", 0] },
                },
            },
            {
                $project: {
                    _id: 1,
                    customer: 1,
                    "product._id": 1,
                    "product.name": 1,
                    "product.thumbnail": 1,
                    "product.isFavourite": true,
                    "product.variant": 1,
                    "product.promotion": {
                        discount: "$product.promotion.discount",
                        expireDate: "$product.promotion.expireDate",
                        status: "$product.promotion.status",
                    },
                },
            },
            {
                $addFields: {
                    "product.first_variant": {
                        $arrayElemAt: ["$product.variant", 0],
                    },
                },
            },
            {
                $unwind: {
                    path: "$product.variant",
                },
            },
            {
                $project: {
                    _id: 1,
                    customer: 1,
                    "product._id": 1,
                    "product.name": 1,
                    "product.thumbnail": 1,
                    "product.actualPrice": "$product.variant.actualPrice",
                    "product.discountedPrice": {
                        $cond: {
                            if: {
                                $and: [
                                    "$product.promotion",
                                    {
                                        $gte: ["$product.promotion.expireDate", new Date()],
                                    },
                                    {
                                        $eq: ["$product.promotion.status", "active"],
                                    },
                                ],
                            },
                            then: {
                                $multiply: [
                                    "$product.variant.actualPrice",
                                    {
                                        $subtract: [1, { $divide: ["$product.promotion.discount", 100] }],
                                    },
                                ],
                            },
                            else: "$product.variant.discountedPrice",
                        },
                    },
                    "product.isFavourite": true,
                },
            },
            {
                $group: {
                    _id: "$_id",
                    customer: {
                        $first: "$customer",
                    },
                    product: {
                        $first: "$product",
                    },
                },
            },
        ]);

        // console.log(list);






        //   .find({ customer: { $in: customerId } }, projection.projection)
        //   .populate({
        //     path: "product",
        //     select: {
        //       _id: 1,
        //       name: 1,
        //       thumbnail: 1,
        //       variant: 1,
        //     },
        //   })
        //   .lean();
        // if (list.length != 0) {
        //   list = list.map((item) => {
        //     let isFavourite = "true";
        //     item.product.actualPrice = item.product.variant[0].actualPrice;
        //     item.product.isFavourite = isFavourite;
        //     delete item.product.variant;
        //     return item;
        //   });
        // }
        return list;
    },
    add: async (customer, product) => {
        var res = await favouriteModel.find({
            customer: customer,
            product: product,
        });
        //No favourite available
        if (res.length == 0) {
            result = new favouriteModel({
                customer,
                product,
            });
            result = await result.save();
            result = "Favourite added";
            return result;
        } else {
            let result = await favouriteModel.deleteOne({
                customer: customer,
                product: product,
            });
            result = "Favourite Deleted";
            return result;
        }
    },
    delete: async (_id) => {
        let result = await favouriteModel.deleteOne({
            _id,
        });
        return result;
    },
};

module.exports = favouriteServices;
