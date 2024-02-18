const subCategoryModel = require("../model/subCategoryModel");
const productModel = require("../model/productsModel");
const projection = require("../config/mongoProjection");
const mongoose = require("mongoose");
const subcategoryModel = require("../model/subCategoryModel");
const uploadFile = require("../utils/uploadFile");
const categoryModel = require("../model/categoryModel");
const promotionCampaignModel = require("../model/promotionCampaignModel");
const promotionModel = require("../model/promotionModel");

const subCategoryServices = {
    getsubcategories: async () => {
        const result = subCategoryModel
            .find()
            .populate({
                path: "category",
                select: { _id: 1, name: 1 },
            })
            .sort({ name: 1 });

        return result;
    },
    getOne: async (_id) => {
        const list = await subCategoryModel.findById(
            { _id },
            projection.projection
        );
        return list;
    },
    //sub
    getProductsBySubCategory: async (subcategoryId) => {
        let today = new Date(new Date().toLocaleDateString());
        let subcategory = await subCategoryModel
            .findById(
                { _id: subcategoryId },
                { _id: 1, name: 1, icon: 1, description: 1, thumbnail: 1 }
            )
            .lean();
        if (subcategory) {
            let products = await productModel.aggregate([
                {
                    $match: {
                        subcategory: new mongoose.Types.ObjectId(subcategoryId),
                        isActive: true
                    }
                },
                {
                    $lookup: {
                        from: "promotions",
                        localField: "_id",
                        foreignField: "product",
                        pipeline: [{ $match: { expireDate: { $gte: today } } }],
                        as: "promotion",
                    },
                },
                {
                    $unwind: {
                        path: "$promotion",
                        preserveNullAndEmptyArrays: true,
                    },
                },
                {
                    $project: {
                        _id: 1,
                        name: 1,
                        title: 1,
                        description: 1,
                        thumbnail: 1,
                        isDeal: 1,
                        discount: 1,
                        variant: {
                            $map: {
                                input: "$variant",
                                as: "variant",
                                in: {
                                    colorName: "$$variant.colorName",
                                    colorHex: "$$variant.colorHex",
                                    actualPrice: "$$variant.actualPrice",
                                    quantity: "$$variant.quantity",
                                    size: "$$variant.size",
                                    isDiscount: 1,
                                    image: "$$variant.image",
                                    sku: "$$variant.sku",
                                    _id: "$$variant._id",
                                    discountedPrice: {
                                        $ifNull: [
                                            {
                                                $subtract: [
                                                    "$$variant.actualPrice",
                                                    {
                                                        $multiply: [
                                                            "$promotion.discount",
                                                            {
                                                                $divide: ["$$variant.actualPrice", 100],
                                                            },
                                                        ],
                                                    },
                                                ],
                                            },
                                            "$$variant.discountedPrice",
                                        ],
                                    },
                                },
                            },
                        },
                    },
                },
            ]);
            // if (products.length != 0) {
            //     products = products.map((item) => {
            //         if (item.isDeal === true) {
            //             var discountedPrice = item.variant[0].actualPrice - item.discount;
            //         } else if (item.isDiscount === true) {
            //             discountedPrice = item.variant[0].discountedPrice;
            //         } else {
            //             discountedPrice = item.variant[0].discountedPrice;
            //         }
            //         item.actualPrice = item.variant[0].actualPrice;
            //         item.discountedPrice = discountedPrice;
            //         delete item.variant;
            //         delete item.isDiscount;
            //         delete item.discount;
            //         delete item.isDeal;

            //         return item;
            //     });
            // }
            if (products.length !== 0) {
                const currentDate = new Date();
                const promotions = await promotionModel
                    .find({
                        expireDate: { $gt: currentDate },
                        status: "active",
                    })
                    .populate("product");

                products = products.map((item) => {
                    const firstVariant = item.variant[0];

                    item.actualPrice = firstVariant.actualPrice;
                    item.discountedPrice = firstVariant.discountedPrice || null;
                    item.promotionPrice = null;
                    item.promotionDiscount = null;
                    delete item.variant;
                    delete item.isDiscount;
                    delete item.discount;
                    delete item.isDeal;


                    const matchedPromotion = promotions.find((promotion) =>
                        promotion.product.some((productId) =>
                            productId.equals(item._id)
                        )
                    );

                    if (matchedPromotion) {
                        const discount = matchedPromotion.discount;
                        item.promotionPrice =
                            firstVariant.actualPrice - (firstVariant.actualPrice / 100) * discount;
                        item.promotionDiscount = discount;
                    }

                    return item;
                });
            }
            subcategory.products = products;
        }
        return subcategory;
    }
    ,
    ProductsBySubCategory: async (subcategoryId) => {
        const subcateogry = await productModel.find(
            { isActive: true, subcategory: { $in: subcategoryId } },
            { _id: 1, name: 1 }
        );
        return subcateogry;
    },
    getSubcategoryByCategoryId: async (categoryId) => {
        const list = await subCategoryModel
            .find({ categoryId }, { _id: 1, name: 1 }, projection.projection)
            .populate({
                path: "category",
            });
        return list;
    },

    add: async (category, name, icon, thumbnail, description, isFeatured) => {
        console.log(icon);
        icon = await uploadFile(icon);
        thumbnail = await uploadFile(thumbnail);
        if (!icon) {
            return null;
        }
        if (!thumbnail) {
            return null;
        }
        let subcategory = new subCategoryModel({
            category: mongoose.Types.ObjectId(category),
            name,
            icon,
            thumbnail,
            description,
            isFeatured,
        });
        const result = await subcategory.save();
        return result;
    },
    update: async (
        subcategoryId,
        category,
        name,
        icon,
        thumbnail,
        description,
        isFeatured
    ) => {
        let result;
        let updatedFiles = {}
        if (icon) {
            icon = await uploadFile(icon);
            updatedFiles = { ...updatedFiles, icon }
        }
        if (thumbnail) {
            thumbnail = await uploadFile(thumbnail);
            updatedFiles = { ...updatedFiles, thumbnail }

        }
        result = await subcategoryModel.findOneAndUpdate(
            { _id: subcategoryId },
            {
                category: mongoose.Types.ObjectId(category),
                name,
                ...updatedFiles,
                description,
                isFeatured,
            },
            { new: true }
        );
        return result;
    },
    delete: async (_id) => {
        var _id = mongoose.Types.ObjectId(_id);

        const result = await subCategoryModel.findOneAndUpdate({ _id: _id }, { isActive: false }, { upsert: true });
        return result;
    },
    subcategory: async (category) => {
        console.log(category);
        const result = await subCategoryModel.find({
            category: category,
        });
        return result;
    },
};

module.exports = subCategoryServices;
