const categoryModel = require("../model/categoryModel");
const subCategoryModel = require("../model/subCategoryModel");
const productModel = require("../model/productsModel");
const projection = require("../config/mongoProjection");
const uploadFile = require("../utils/uploadFile");
const mongoose = require("mongoose");
const subcategoryModel = require("../model/subCategoryModel");
const { ObjectId } = require('mongoose').Types;
const promotionModel = require("../model/promotionModel")
const { inferCategoryGender, buildCategoryGenderQuery } = require("../utils/categoryGender");


const categoryServices = {
    get: async (gender) => {
        const filter = gender ? buildCategoryGenderQuery(gender) : {};
        const list = await categoryModel
            .find(filter, projection.projection)
            .sort({ name: 1 });
        return list;
    },
    getOne: async (_id) => {
        const list = await categoryModel.findById({ _id }, projection.projection);
        return list;
    },
    getProducts: async (category) => {
        let today = new Date(new Date().toLocaleDateString());
        let list = await productModel.aggregate([
            {
                $match: { category: new mongoose.Types.ObjectId(category) },
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
                    category: 1,
                    subcategory: 1,
                    name: 1,
                    title: 1,
                    description: 1,
                    longDescription: 1,
                    isColor: 1,
                    thumbnail: 1,
                    images: 1,
                    isActive: 1,
                    vendor: 1,
                    isFeatured: 1,
                    isSale: 1,
                    isDeal: 1,
                    discount: 1,
                    isDiscount: 1,
                    oneTimeDeal: 1,
                    inStock: 1,
                    sequence: 1,
                    ratingCount: 1,
                    ratingNumber: 1,
                    isFavourite: 1,
                    isTaxable: 1,
                    taxHead: 1,
                    taxType: 1,
                    isPercentage: 1,
                    taxAmount: 1,
                    metaData: 1,
                    metaDescription: 1,
                    addons: 1,
                    tags: 1,
                    createdAt: 1,
                    updatedAt: 1,
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
            {
                $lookup: {
                    from: "categories",
                    localField: "category",
                    foreignField: "_id",
                    let: { id: "$category" },
                    pipeline: [
                        { $match: { $expr: { $eq: ["$_id", "$$id"] } } },
                        { $project: { _id: 1, name: 1 } },
                    ],
                    as: "category",
                },
            },
            {
                $unwind: {
                    path: "$category",
                },
            },
            {
                $lookup: {
                    from: "subcategories",
                    localField: "subcategory",
                    foreignField: "_id",
                    let: { id: "$subcategory" },
                    pipeline: [
                        { $match: { $expr: { $eq: ["$_id", "$$id"] } } },
                        { $project: { _id: 1, name: 1 } },
                    ],
                    as: "subcategory",
                },
            },
            {
                $unwind: {
                    path: "$subcategory",
                },
            },
        ]);
        if (list.length != 0) {
            list = list.map((item) => {
                images = item.images;
                if (item.isDeal === true) {
                    discount = item.discount;
                    for (let i of item.variant) {
                        actualPrice = i.actualPrice;
                        i.discountedPrice = actualPrice - discount;
                        image = i.image;
                        if (!images.includes(image)) {
                            images.push(image);
                        }
                    }
                } else {
                    for (var j of item.variant) {
                        image = j.image;
                        if (!images.includes(image)) {
                            images.push(image);
                        }
                    }
                }
                return item;
            });
        }
        return list;
    },

    // getSubcategoriesAndProductsByCategoryId: async (categoryId, page, pageSize) => {
    //     const subcategories = await categoryModel.aggregate([
    //         {
    //             $match: {
    //                 _id: mongoose.Types.ObjectId(categoryId),
    //             },
    //         },
    //         {
    //             $lookup: {
    //                 from: "subcategories",
    //                 localField: "_id",
    //                 foreignField: "category",
    //                 as: "subcategories",
    //             },
    //         },
    //         {
    //             $project: {
    //                 _id: 1,
    //                 name: 1,
    //                 icon: 1,
    //                 description: 1,
    //                 subcategories: {
    //                     $map: {
    //                         input: "$subcategories",
    //                         as: "subcategory",
    //                         in: {
    //                             _id: "$$subcategory._id",
    //                             name: "$$subcategory.name",
    //                             thumbnail: "$$subcategory.thumbnail",
    //                             description: "$$subcategory.description",
    //                             icon: "$$subcategory.icon",
    //                         },
    //                     },
    //                 },
    //             },
    //         },
    //         {
    //             $lookup: {
    //                 from: "products",
    //                 localField: "subcategories._id",
    //                 foreignField: "subcategory",
    //                 as: "products",
    //             },
    //         },
    //         {
    //             $project: {
    //                 _id: 1,
    //                 name: 1,
    //                 icon: 1,
    //                 description: 1,
    //                 subcategories: {
    //                     _id: 1,
    //                     name: 1,
    //                     thumbnail: 1,
    //                     description: 1,
    //                     icon: 1,
    //                 },
    //                 products: {
    //                     $map: {
    //                         input: "$products",
    //                         as: "product",
    //                         in: {
    //                             name: "$$product.name",
    //                             title: "$$product.title",
    //                             description: "$$product.description",
    //                             images: "$$product.images",
    //                             thumbnail: "$$product.thumbnail",
    //                             variant: "$$product.variant",
    //                         },
    //                     },
    //                 },

    //             },
    //         },
    //     ]);

    //     if (subcategories.length > 0 && subcategories[0].products.length > 0) {

    //         const currentDate = new Date();
    //         const promotions = await promotionModel
    //             .find({
    //                 expireDate: { $gt: currentDate },
    //                 status: "active",
    //             })
    //             .populate("product");

    //         if (promotions.length !== 0) {
    //             products = products.map((item) => {
    //                 const matchedPromotion = promotions.find((promotion) =>
    //                     promotion.product.some((productId) =>
    //                         productId.equals(item._id)
    //                     )
    //                 );

    //                 if (matchedPromotion) {
    //                     const discount = matchedPromotion.discount;
    //                     const firstVariant = item.variant[0];
    //                     item.promotionPrice =
    //                         firstVariant.actualPrice -
    //                         (firstVariant.actualPrice / 100) * discount;
    //                     item.promotiondiscount = discount;
    //                 }

    //                 const firstVariant = item.variant[0];
    //                 item.actualPrice = firstVariant.actualPrice;
    //                 item.discountedPrice = firstVariant.discountedPrice || null,

    //                     delete item.variant;

    //                 return item;
    //             });
    //         }
    //     }
    //     return subcategories;
    // },
    // if (products.length !== 0) {
    //     const currentDate = new Date();
    //     const promotions = await promotionModel
    //         .find({
    //             expireDate: { $gt: currentDate },
    //             status: "active",
    //         })
    //         .populate("product");

    //     if (promotions.length !== 0) {
    //         products = products.map((item) => {
    //             const matchedPromotion = promotions.find((promotion) =>
    //                 promotion.product.some((productId) =>
    //                     productId.equals(item._id)
    //                 )
    //             );

    //             if (matchedPromotion) {
    //                 const discount = matchedPromotion.discount;
    //                 const firstVariant = item.variant[0];
    //                 item.promotionPrice =
    //                     firstVariant.actualPrice -
    //                     (firstVariant.actualPrice / 100) * discount;
    //                 item.promotiondiscount = discount;
    //             }

    //             const firstVariant = item.variant[0];
    //             item.actualPrice = firstVariant.actualPrice;
    //             item.discountedPrice = firstVariant.discountedPrice || null,

    //                 delete item.variant;

    //             return item;
    //         });
    //     }
    // }
    getSubcategoriesAndProductsByCategoryId: async (categoryId, page, pageSize) => {
        // const subcategories = await categoryModel.aggregate([
        //     {
        //         $match: {
        //             _id: mongoose.Types.ObjectId(categoryId),
        //         },
        //     },
        //     {
        //         $lookup: {
        //             from: "subcategories",
        //             localField: "_id",
        //             foreignField: "category",
        //             as: "subcategories",
        //         },
        //     },
        //     {
        //         $project: {
        //             _id: 1,
        //             name: 1,
        //             icon: 1,
        //             description: 1,
        //             subcategories: {
        //                 $map: {
        //                     input: "$subcategories",
        //                     as: "subcategory",
        //                     in: {
        //                         _id: "$$subcategory._id",
        //                         name: "$$subcategory.name",
        //                         thumbnail: "$$subcategory.thumbnail",
        //                         description: "$$subcategory.description",
        //                         icon: "$$subcategory.icon",
        //                     },
        //                 },
        //             },
        //         },
        //     },
        //     {
        //         $lookup: {
        //             from: "products",
        //             localField: "_id",
        //             foreignField: "category",
        //             as: "products",
        //         },
        //     },
        //     {
        //         $addFields: {
        //             totalProducts: { $size: "$products" },
        //             subcategories: {
        //                 $map: {
        //                     input: "$subcategories",
        //                     as: "subcategory",
        //                     in: {
        //                         $mergeObjects: [
        //                             "$$subcategory",
        //                             {
        //                                 totalProducts: {
        //                                     $size: {
        //                                         $filter: {
        //                                             input: "$products",
        //                                             as: "product",
        //                                             cond: {
        //                                                 $eq: ["$$product.subcategory", "$$subcategory._id"],
        //                                             },
        //                                         },
        //                                     },
        //                                 },
        //                             },
        //                         ],
        //                     },
        //                 },
        //             },
        //             products: {
        //                 $map: {
        //                     input: "$products",
        //                     as: "product",
        //                     in: {
        //                         _id: "$$product._id",
        //                         name: "$$product.name",
        //                         title: "$$product.title",
        //                         description: "$$product.description",
        //                         images: "$$product.images",
        //                         thumbnail: "$$product.thumbnail",
        //                         variant: "$$product.variant",
        //                     },
        //                 },
        //             },
        //         },
        //     },
        //     {
        //         $project: {
        //             _id: 1,
        //             name: 1,
        //             icon: 1,
        //             description: 1,
        //             subcategories: {
        //                 _id: 1,
        //                 name: 1,
        //                 thumbnail: 1,
        //                 description: 1,
        //                 icon: 1,
        //                 totalProducts: 1,
        //             },
        //             products: 1,
        //         },
        //     },
        // ]);
        const subcategories = await categoryModel.aggregate([
            {
                $match: {
                    _id: mongoose.Types.ObjectId(categoryId),
                    isActive: true,
                },
            },
            {
                $lookup: {
                    from: "subcategories",
                    localField: "_id",
                    foreignField: "category",
                    as: "subcategories",
                },
            },
            {
                $project: {
                    _id: 1,
                    name: 1,
                    icon: 1,
                    description: 1,
                    subcategories: {
                        $map: {
                            input: {
                                $filter: {
                                    input: "$subcategories",
                                    as: "subcategory",
                                    cond: { $eq: ["$$subcategory.isActive", true] },
                                },
                            },
                            as: "subcategory",
                            in: {
                                _id: "$$subcategory._id",
                                name: "$$subcategory.name",
                                thumbnail: "$$subcategory.thumbnail",
                                description: "$$subcategory.description",
                                icon: "$$subcategory.icon",
                            },
                        },
                    },
                },
            },
            {
                $lookup: {
                    from: "products",
                    localField: "_id",
                    foreignField: "category",
                    as: "products",
                },
            },
            {
                $addFields: {
                    totalProducts: {
                        $size: {
                            $filter: {
                                input: "$products",
                                as: "product",
                                cond: {
                                    $eq: ["$$product.isActive", true],
                                },
                            },
                        },
                    },
                    subcategories: {
                        $map: {
                            input: "$subcategories",
                            as: "subcategory",
                            in: {
                                $mergeObjects: [
                                    "$$subcategory",
                                    {
                                        totalProducts: {
                                            $size: {
                                                $filter: {
                                                    input: "$products",
                                                    as: "product",
                                                    cond: {
                                                        $and: [
                                                            {
                                                                $eq: [
                                                                    "$$product.subcategory",
                                                                    "$$subcategory._id",
                                                                ],
                                                            },
                                                            {
                                                                $eq: [
                                                                    "$$product.isActive",
                                                                    true,
                                                                ],
                                                            },
                                                        ],
                                                    },
                                                },
                                            },
                                        },
                                    },
                                ],
                            },
                        },
                    },
                    products: {
                        $map: {
                            input: {
                                $filter: {
                                    input: "$products",
                                    as: "product",
                                    cond: {
                                        $eq: ["$$product.isActive", true],
                                    },
                                },
                            },
                            as: "product",
                            in: {
                                _id: "$$product._id",
                                name: "$$product.name",
                                title: "$$product.title",
                                description: "$$product.description",
                                images: "$$product.images",
                                thumbnail: "$$product.thumbnail",
                                variant: "$$product.variant",
                            },
                        },
                    },
                },
            },
            {
                $project: {
                    _id: 1,
                    name: 1,
                    icon: 1,
                    description: 1,
                    subcategories: {
                        _id: 1,
                        name: 1,
                        thumbnail: 1,
                        description: 1,
                        icon: 1,
                        totalProducts: 1,
                    },
                    products: 1,
                },
            },
        ]);



        if (subcategories.length > 0 && subcategories[0].products.length > 0) {
            const currentDate = new Date();
            const promotions = await promotionModel
                .find({
                    expireDate: { $gte: currentDate },
                    status: "active",
                })
                .populate("product");

            if (Array.isArray(promotions)) {
                subcategories.forEach((category) => {
                    category.products.forEach((product) => {
                        const matchedPromotion = promotions.find((promotion) =>
                            promotion.product.some((productObj) => productObj._id.equals(product._id))
                        );

                        console.log("Matched Promotions", matchedPromotion);

                        if (matchedPromotion) {
                            const discount = matchedPromotion.discount;
                            const firstVariant = product.variant[0];
                            product.promotionPrice =
                                firstVariant.actualPrice -
                                (firstVariant.actualPrice / 100) * discount;
                            product.promotionDiscount = discount;

                            product.actualPrice = firstVariant.actualPrice;
                            product.discountedPrice = firstVariant.discountedPrice || null;
                            // console.log("firstVariant.discountedPrice", firstVariant.discountedPrice)
                        } else {
                            const firstVariant = product.variant[0];
                            product.actualPrice = firstVariant.actualPrice;
                            product.discountedPrice = firstVariant.discountedPrice || null;
                        }

                        delete product.variant;
                    });
                });
            } else {
                console.error("Promotions is not an array:", promotions);
            }
        }


        return subcategories;


    },


    getSubcategories: async (categoryId) => {
        const subcategories = await subCategoryModel.find(
            { category: mongoose.Types.ObjectId(categoryId) },
            { _id: 1, name: 1, icon: 1, thumbnail: 1 }
        );
        const category = await categoryModel.findOne(
            { _id: mongoose.Types.ObjectId(categoryId) },
            { _id: 1, name: 1, icon: 1, description: 1, thumbnail: 1 }
        );
        dict = { category: category, subcategories: subcategories };
        return dict;
    },
    add: async (name, icon, thumbnail, description, isFeatured, gender) => {
        icon = await uploadFile(icon);
        thumbnail = await uploadFile(thumbnail);
        if (!icon) {
            return null;
        }
        if (!thumbnail) {
            return null;
        }
        const category = new categoryModel({
            name,
            icon,
            thumbnail,
            description,
            isFeatured,
            gender: inferCategoryGender(name, gender),
        });
        const result = await category.save();
        return result;
    },
    update: async (_id, name, icon, description, thumbnail, isFeatured, isActive, gender) => {
        try {
            let uploadedIcon, uploadedThumbnail;

            if (icon) {
                uploadedIcon = await uploadFile(icon);
            }

            if (thumbnail) {
                uploadedThumbnail = await uploadFile(thumbnail);
            }

            const objectId = mongoose.Types.ObjectId(_id);
            const updatePayload = {
                name,
                description,
                isFeatured,
                icon: uploadedIcon,
                thumbnail: uploadedThumbnail,
                isActive,
            };
            if (gender !== undefined) {
                updatePayload.gender = inferCategoryGender(name, gender);
            } else if (name) {
                updatePayload.gender = inferCategoryGender(name);
            }

            const result = await categoryModel.findOneAndUpdate(
                { _id: objectId },
                updatePayload,
                { upsert: true }
            );

            return result;
        } catch (error) {
            console.error("Error in update:", error);
            throw error;
        }
    }

    ,
    delete: async (_id) => {
        var _id = mongoose.Types.ObjectId(_id);
        const result = await categoryModel.findOneAndUpdate({ _id: _id }, { isActive: false }, { upsert: true });
        return result;
    },
};

module.exports = categoryServices;
