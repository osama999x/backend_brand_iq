const productsModel = require("../model/productsModel");
const productMetaModel = require("../model/productMetaModel");
const projection = require("../config/mongoProjection");
const reviewModel = require("../model/reviewModel");
const mongoose = require("mongoose");
const uploadFile = require("../utils/uploadFile");
const ProductQuantityLogModel = require("../model/productQuntityLogModel");
const sendEmailNotificationInfo = require("../utils/sendEmailNotficationInfo");
const promotionModel = require("../model/promotionModel");
const SubscribeModel = require("../model/subscribeModel");
const sendNotificationEmail = require("../utils/sendNotificationEmail");
const productVariantServices = require("./productVariantServices");
const dealBuyerLogModel = require("../model/dealBuyerLogModel");
// const productsImagesModel = require("../model/productsImagesModel");
const reviewServices = require("../services/reviewServices");

const productsServices = {
    getproducts: async () => {
        let products = await productsModel
            .find({}, projection.projection)
            .populate({
                path: "category",
                select: { _id: 1, title: 1, name: 1 },
            })
            .populate({
                path: "subcategory",
                select: { _id: 1, title: 1, name: 1 },
            })
            .sort({ createdAt: -1 });
        products = JSON.stringify(products);
        products = JSON.parse(products);
        var productLength = products.length;
        var variantQuantity = 0;
        if (products.length != 0) {
            for (let i = 0; i < productLength; i++) {
                var calculateQuantity = 0;
                var variantLength = products[i].variant.length;
                for (let j = 0; j < variantLength; j++) {
                    variantQuantity = products[i].variant[j].quantity;
                    var addQuantity = variantQuantity;
                    calculateQuantity += addQuantity;
                }

                products[i]["AvailbeQuantity"] = calculateQuantity;
            }
        }
        return products;
    },
    quantityUpdate: async (
        productId,
        sku,
        actualPrice,
        discountedPrice,
        quantity
    ) => {
        const filter = { _id: productId, "variant.sku": sku };

        const update = {
            $set: {
                "variant.$.actualPrice": actualPrice,
            },
        };


        if (discountedPrice) {
            update.$set["variant.$.discountedPrice"] = discountedPrice;
            update.$set["isDiscount"] = true
        }
        if (quantity) {
            update.$set["variant.$.quantity"] = quantity
        }

        try {
            const options = { new: true };
            const updateProduct = await productsModel.findOneAndUpdate(filter, update, options);

            if (updateProduct && discountedPrice !== null) {
                const data = new ProductQuantityLogModel({
                    product: productId,
                    sku,
                    actualPrice,
                    discountedPrice,
                    quantity,
                });
                await data.save();
            }


            return updateProduct;
        } catch (error) {
            console.error('Error updating quantity:', error);
            throw error;
        }
    },
    getProductsByIdWeb: async (productId) => {
        const product = await productsModel
            .findById({ _id: productId })
            .populate({
                path: "category",
            })
            .populate({
                path: "subcategory",
            });
        return product;
    },
    getProductsById: async (productId) => {
        let today = new Date(new Date());
        // let checkProduct = await productsModel.findOne(
        //   {
        //     _id: productId,
        //   },
        //   { isDeal: 1 }
        // );
        // if (checkProduct.isDeal === true) {
        //   var product = await productsModel.aggregate([
        //     {
        //       $match: {
        //         $and: [
        //           { _id: new mongoose.Types.ObjectId(productId) },
        //           { dealExpire: { $gte: today } },
        //         ],
        //       },
        //     },
        //     {
        //       $project: {
        //         _id: 1,
        //         category: 1,
        //         subcategory: 1,
        //         name: 1,
        //         title: 1,
        //         description: 1,
        //         longDescription: 1,
        //         isColor: 1,
        //         thumbnail: 1,
        //         images: 1,
        //         isActive: 1,
        //         vendor: 1,
        //         isFeatured: 1,
        //         isSale: 1,
        //         isDeal: 1,
        //         dealExpire: 1,
        //         discount: 1,
        //         isDiscount: 1,
        //         inStock: 1,
        //         sequence: 1,
        //         ratingCount: 1,
        //         ratingNumber: 1,
        //         isFavourite: 1,
        //         isTaxable: 1,
        //         taxHead: 1,
        //         taxType: 1,
        //         isPercentage: 1,
        //         taxAmount: 1,
        //         metaData: 1,
        //         metaDescription: 1,
        //         addons: 1,
        //         tags: 1,
        //         variant: {
        //           $map: {
        //             input: "$variant",
        //             as: "variant",
        //             in: {
        //               colorName: "$$variant.colorName",
        //               colorHex: "$$variant.colorHex",
        //               actualPrice: "$$variant.actualPrice",
        //               quantity: "$$variant.quantity",
        //               size: "$$variant.size",
        //               image: "$$variant.image",
        //               sku: "$$variant.sku",
        //               _id: "$$variant._id",
        //               discountedPrice: {
        //                 $ifNull: [
        //                   {
        //                     $subtract: ["$$variant.actualPrice", "$discount"],
        //                   },
        //                   "$$variant.discountedPrice",
        //                 ],
        //               },
        //             },
        //           },
        //         },
        //       },
        //     },
        //     {
        //       $lookup: {
        //         from: "categories",
        //         localField: "category",
        //         foreignField: "_id",
        //         let: {
        //           id: "$category",
        //         },
        //         pipeline: [
        //           {
        //             $match: {
        //               $expr: {
        //                 $eq: ["$_id", "$$id"],
        //               },
        //             },
        //           },
        //           {
        //             $project: {
        //               _id: 1,
        //               name: 1,
        //             },
        //           },
        //         ],
        //         as: "category",
        //       },
        //     },
        //     {
        //       $unwind: {
        //         path: "$category",
        //       },
        //     },
        //     {
        //       $lookup: {
        //         from: "subcategories",
        //         localField: "subcategory",
        //         foreignField: "_id",
        //         let: {
        //           id: "$subcategory",
        //         },
        //         pipeline: [
        //           {
        //             $match: {
        //               $expr: {
        //                 $eq: ["$_id", "$$id"],
        //               },
        //             },
        //           },
        //           {
        //             $project: {
        //               _id: 1,
        //               name: 1,
        //             },
        //           },
        //         ],
        //         as: "subcategory",
        //       },
        //     },
        //     {
        //       $unwind: {
        //         path: "$subcategory",
        //       },
        //     },
        //   ]);
        // } else {
        var product = await productsModel.aggregate([
            {
                $match: { _id: new mongoose.Types.ObjectId(productId) },
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
                    oneTimeDeal: 1,
                    isDiscount: 1,
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
                                isOnPromotion: { $cond: { if: "$promotion", then: true, else: false } },
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


        if (product.length != 0 && product[0].isDeal === true) {
            discount = product[0].discount;
            images = product[0].images;
            for (var item of product[0].variant) {
                actualPrice = item.actualPrice;
                item.discountedPrice = actualPrice - discount;
                image = item.image;
                if (!images.includes(image)) {
                    images.push(image);
                }
            }
        } else {
            images = product[0].images;
            for (var item of product[0].variant) {
                image = item.image;
                if (image && !images.includes(image)) {
                    images.push(image);
                }
            }
        }

        // Retrieve related products in the same subcategory
        // var relatedProducts = await productsModel.aggregate([
        //     {
        //         $match: {
        //             subcategory: new mongoose.Types.ObjectId(product[0].subcategory._id),
        //             _id: { $ne: new mongoose.Types.ObjectId(productId) }, // Excluding the current product
        //         },
        //     },
        //     {
        //         $lookup: {
        //             from: "promotions",
        //             localField: "_id",
        //             foreignField: "product",
        //             pipeline: [{ $match: { expireDate: { $gte: today } } }],
        //             as: "promotion",
        //         },
        //     },
        //     {
        //         $unwind: {
        //             path: "$promotion",
        //             preserveNullAndEmptyArrays: true,
        //         },
        //     },
        //     {
        //         $project: {
        //             _id: 1,
        //             category: 1,
        //             subcategory: 1,
        //             name: 1,
        //             title: 1,
        //             //description: 1,
        //             //longDescription: 1,
        //             isColor: 1,
        //             thumbnail: 1,
        //             //images: 1,
        //             isActive: 1,
        //             //vendor: 1,
        //             //isFeatured: 1,
        //             //isSale: 1,
        //             //isDeal: 1,
        //             discount: 1,
        //             // oneTimeDeal: 1,
        //             isDiscount: 1,
        //             inStock: 1,
        //             //sequence: 1,
        //             //ratingCount: 1,
        //             //ratingNumber: 1,
        //             //isFavourite: 1,
        //             //isTaxable: 1,
        //             //taxHead: 1,
        //             //taxType: 1,
        //             //isPercentage: 1,
        //             //taxAmount: 1,
        //             //metaData: 1,
        //             //metaDescription: 1,
        //             //addons: 1,
        //             //tags: 1,
        //             //createdAt: 1,
        //             //updatedAt: 1,
        //             variant: {
        //                 $map: {
        //                     input: "$variant",
        //                     as: "variant",
        //                     in: {
        //                         colorName: "$$variant.colorName",
        //                         colorHex: "$$variant.colorHex",
        //                         actualPrice: "$$variant.actualPrice",
        //                         quantity: "$$variant.quantity",
        //                         size: "$$variant.size",
        //                         image: "$$variant.image",
        //                         sku: "$$variant.sku",
        //                         _id: "$$variant._id",
        //                         isOnPromotion: { $cond: { if: "$promotion", then: true, else: false } },
        //                         discountedPrice: {
        //                             $ifNull: [
        //                                 {
        //                                     $subtract: [
        //                                         "$$variant.actualPrice",
        //                                         {
        //                                             $multiply: [
        //                                                 "$promotion.discount",
        //                                                 {
        //                                                     $divide: ["$$variant.actualPrice", 100],
        //                                                 },
        //                                             ],
        //                                         },
        //                                     ],
        //                                 },
        //                                 "$$variant.discountedPrice",

        //                             ],
        //                         },
        //                     },
        //                 },
        //             },
        //             //  promotionDiscount: {
        //             //     $cond: {
        //             //         if: { $gt: ["$isOnPromotion", false] },
        //             //         then: "$variant.discountedPrice",
        //             //         else: null  // or any default value you prefer when not in promotion
        //             //     }
        //             // },
        //         },
        //     },
        //     {
        //         $lookup: {
        //             from: "categories",
        //             localField: "category",
        //             foreignField: "_id",
        //             let: { id: "$category" },
        //             pipeline: [
        //                 { $match: { $expr: { $eq: ["$_id", "$$id"] } } },
        //                 { $project: { _id: 1, name: 1 } },
        //             ],
        //             as: "category",
        //         },
        //     },
        //     {
        //         $unwind: {
        //             path: "$category",
        //         },
        //     },
        //     {
        //         $lookup: {
        //             from: "subcategories",
        //             localField: "subcategory",
        //             foreignField: "_id",
        //             let: { id: "$subcategory" },
        //             pipeline: [
        //                 { $match: { $expr: { $eq: ["$_id", "$$id"] } } },
        //                 { $project: { _id: 1, name: 1 } },
        //             ],
        //             as: "subcategory",
        //         },
        //     },
        //     {
        //         $unwind: {
        //             path: "$subcategory",
        //         },
        //     },
        // ]);
        var relatedProducts = await productsModel.aggregate([
            {
                $match: {
                    subcategory: new mongoose.Types.ObjectId(product[0].subcategory._id),
                    _id: { $ne: new mongoose.Types.ObjectId(productId) },
                    isActive: true

                }
            },
            {
                $project: projection.hometrendprojection,
            },
        ]);
        if (relatedProducts.length !== 0) {
            const currentDate = new Date();
            const promotions = await promotionModel
                .find({
                    expireDate: { $gt: currentDate },
                    status: "active",
                })
                .populate("product");

            relatedProducts = relatedProducts.map((item) => {
                const firstVariant = item.variant[0];

                item.actualPrice = firstVariant.actualPrice;
                item.discountedPrice = firstVariant.discountedPrice || null;

                delete item.variant;

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





        // if (relatedProducts.length != 0) {
        //     relatedProducts = relatedProducts.map((item) => {
        //         if (item.isDeal === true) {
        //             actualPrice = item.variant[0].actualPrice;
        //             discountedPrice = item.variant[0].actualPrice - item.discount;
        //             var price = item.variant[0].actualPrice - item.discount;
        //         } else if (item.isDiscount === true) {
        //             actualPrice = item.variant[0].actualPrice;
        //             discountedPrice = item.variant[0].discountedPrice;
        //             price = item.variant[0].discountedPrice;
        //         } else {
        //             actualPrice = item.variant[0].actualPrice;
        //             discountedPrice = item.variant[0].discountedPrice;
        //             if (item.variant[0].discountedPrice > 0) {
        //                 price = item.variant[0].discountedPrice;
        //             } else {
        //                 price = item.variant[0].actualPrice;
        //             }
        //         }

        //         item.actualPrice = actualPrice;
        //         item.discountedPrice = discountedPrice;
        //         item.price = price;
        //         //item.discountedPrice = discountedPrice;
        //         delete item.variant;
        //         delete item.isDiscount;
        //         delete item.discount;
        //         delete item.isDeal;

        //         return item;
        //     });
        // }
        // if (relatedProducts.length != 0) {
        //     relatedProducts = relatedProducts.map((item) => {
        //         let price;

        //         // Check if the product has a promotionDiscount
        //         if (item.promotionDiscount) {
        //             price = parseFloat(item.promotionDiscount); // Assuming promotionDiscount is a String, parse it to a Number
        //         } else {
        //             // Use the existing logic for calculating price if promotionDiscount is not present
        //             if (item.isDeal === true) {
        //                 price = item.variant[0].actualPrice - item.discount;
        //             } else if (item.isDiscount === true) {
        //                 price = item.variant[0].discountedPrice;
        //             } else {
        //                 if (item.variant[0].discountedPrice > 0) {
        //                     price = item.variant[0].discountedPrice;
        //                 } else {
        //                     price = item.variant[0].actualPrice;
        //                 }
        //             }
        //         }

        //         item.actualPrice = item.variant[0].actualPrice;
        //         item.discountedPrice = item.variant[0].discountedPrice;
        //         // item.price = price;

        //         delete item.variant;
        //         delete item.isDiscount;
        //         delete item.discount;
        //         delete item.isDeal;

        //         return item;
        //     });
        // }
        const Review = await reviewServices.getProductReview(productId);
        if (Review) {
            product[0].Review = Review;
        }
        return {
            msg: "Products",
            data: {
                mainProduct: product[0],
                relatedProducts: relatedProducts,
            },
        };
    },
    getProductsDetails: async (productId, sku, quantity) => {
        var product = await productsModel.findOne({
            $and: [{ _id: productId }, { "variant.sku": sku }],
        });
        if (product) {
            var productVariantLength = product.variant.length;
            for (var i = 0; i < productVariantLength; i++) {
                if (
                    product.variant[i].sku === sku &&
                    product.variant[i].quantity >= quantity
                ) {
                    return true;
                }
            }
        } else {
            throw "Product Not Availble";
        }
    },

    add: async (
        categoryId,
        subcategoryId,
        name,
        title,
        description,
        longDescription,
        isDiscount,
        isDeal,
        dealExpire,
        oneTimeDeal,
        discount,
        variant,
        images,
        isActive,
        vendor,
        isTaxable,
        taxHead,
        taxType,
        isPercentage,
        taxAmount,
        metaData,
        metaDescription,
        tags,
        addons,
        isFeatured
    ) => {
        // thumbnail = await uploadFile(thumbnail);
        //console.log("images", images);

        var image = [];
        //Product have images

        if (images.length != 0) {
            imgArr = await Promise.all(images?.map(uploadFile));
            console.log(imgArr);
            image = [...imgArr]
            var thumbnail = imgArr[0];
        }
        // let variants = [];
        // switch (variant.length !== 0) {
        //     //case 1 no color no size
        //     case variant[0].colorName === "" && variant[0].size.length === 0:
        //         variants = await productVariantServices.handleNoColorNoSize(
        //             variant,
        //             isDiscount
        //         );
        //         break;
        //     //Case 2 have color but not size
        //     case variant[0].colorName !== "" && variant[0].size.length === 0:
        //         variants = await productVariantServices.handleColorNoSize(
        //             variant,
        //             isDiscount
        //         );
        //         break;
        //     //case 3 no color but size exist
        //     case variant[0].colorName === "" && variant[0].size.length !== 0:
        //         variants = await productVariantServices.handleNoColorSize(
        //             variant,
        //             isDiscount
        //         );
        //         break;
        //     //Case 4 Multi Colors mutli size
        //     case variant[0].colorName !== "" && variant[0].size.length !== 0:
        //         variants = await productVariantServices.handleColorSize(
        //             variant,
        //             isDiscount
        //         );
        //         break;
        // }
        //case 1 no color no size
        // if (variant[0].colorName === "" && variant[0].size.length === 0) {
        //   let variants = [];
        //   for (let i of variant) {
        //     if (i.image) {
        //       var image = await uploadFile(i.image);
        //     } else {
        //       image = "";
        //     }
        //     variants.push({
        //       colorName: "",
        //       colorHex: "",
        //       actualPrice: i.actualPrice,
        //       discountedPrice: i.discountedPrice,
        //       quantity: i.quantity,
        //       sku: `${i.sku}`,
        //       size: "",
        //       image: image,
        //     });
        //   }
        //   variant = variants;
        // }
        //case 2 no size but color exist
        // else if (variant[0].colorName != "" && variant[0].size.length === 0) {
        //   let variants = [];
        //   for (let i of variant) {
        //     if (i.image) {
        //       var image = await uploadFile(i.image);
        //     } else {
        //       image = "";
        //     }
        //     variants.push({
        //       colorName: i.colorName,
        //       colorHex: i.colorHex,
        //       actualPrice: i.actualPrice,
        //       discountedPrice: i.discountedPrice,
        //       quantity: i.quantity,
        //       sku: `${i.sku}`,
        //       size: "",
        //       image: image,
        //     });
        //   }
        //   variant = variants;
        // }
        //case 3 no color but size exist
        // else if (variant[0].colorName === "" && variant[0].size.length != 0) {
        //   let variants = [];
        //   for (var item of variant) {
        //     if (item.image) {
        //       var image = await uploadFile(item.image);
        //     } else {
        //       image = "";
        //     }
        //     for (var i of item.size) {
        //       variants.push({
        //         colorName: "",
        //         colorHex: "",
        //         actualPrice: i.actualPrice,
        //         discountedPrice: i.discountedPrice,
        //         quantity: i.quantity,
        //         sku: `${item.sku}${i.name}`,
        //         size: i.name,
        //         image: image,
        //       });
        //     }
        //   }
        //   variant = variants;
        // }
        // case 3 color and size exist
        // else if (variant[0].colorName != "" && variant[0].size.length != 0) {
        //   let variants = [];
        //   for (var item of variant) {
        //     if (item.image) {
        //       var image = await uploadFile(item.image);
        //     } else {
        //       image = "";
        //     }
        //     for (var i of item.size) {
        //       variants.push({
        //         colorName: item.colorName,
        //         colorHex: item.colorHex,
        //         actualPrice: i.actualPrice,
        //         discountedPrice: i.discountedPrice,
        //         quantity: i.quantity,
        //         sku: `${item.sku}${i.name}`,
        //         size: i.name,
        //         image: image,
        //       });
        //     }
        //   }
        //   variant = variants;
        // }
        //        {'variant.sku':{$ne:variant.sku}}

        products = new productsModel({
            category: mongoose.Types.ObjectId(categoryId),
            subcategory: mongoose.Types.ObjectId(subcategoryId),
            name,
            title,
            description,
            longDescription,
            isDiscount,
            isDeal,
            dealExpire,
            oneTimeDeal,
            discount,
            variant,
            thumbnail,
            images: image,
            isActive,
            vendor,
            isTaxable,
            taxHead,
            taxType,
            isPercentage,
            taxAmount,
            metaData,
            metaDescription,
            tags,
            addons,
            isFeatured,
        });
        const result = await products.save();
        console.log(result);
        if (result) {
            let subject = sendEmailNotificationInfo.product.title;
            let text =
                sendEmailNotificationInfo.product.body + `${name}. Now you can buy`;
            await sendNotificationEmail(subject, text);
            productMeta = new productMetaModel({
                product: mongoose.Types.ObjectId(result._id),
                category: mongoose.Types.ObjectId(result.category),
                subcategory: mongoose.Types.ObjectId(result.subcategory),
                metaData,
                metaDescription,
            });
            await productMeta.save();
        }
        return result;
    },
    update: async (
        _id,
        category,
        subcategory,
        name,
        title,
        description,
        longDescription,
        isDiscount,
        isDeal,
        dealExpire,
        oneTimeDeal,
        discount,
        variant,
        thumbnail,
        oldImages,
        images,
        isActive,
        vendor,
        isTaxable,
        taxHead,
        taxType,
        isPercentage,
        taxAmount,
        metaData,
        metaDescription,
        tags,
        addons,
        newImages,
        isFeatured
    ) => {


        let updatedData = {
            category: mongoose.Types.ObjectId(category),
            subcategory: mongoose.Types.ObjectId(subcategory),
            name,
            title,
            description,
            longDescription,
            isDiscount,
            isDeal,
            dealExpire,
            oneTimeDeal,
            discount,
            variant,
            thumbnail,
            vendor,
            isTaxable,
            images: oldImages,
            isActive,
            taxHead,
            taxType,
            isPercentage,
            taxAmount,
            metaData,
            metaDescription,
            tags,
            addons,
            isFeatured,

        }

        if (images.length) {
            images = await Promise.all(images?.map(uploadFile));
            updatedData.images = [...images, ...updatedData.images]
            updatedData.thumbnail = images[0]
        }

        result = await productsModel.findOneAndUpdate(
            { _id },
            updatedData,
            { upsert: true }
        );


        if (result) {
            await productMetaModel.findOneAndUpdate(
                { product: result._id },
                {
                    category: mongoose.Types.ObjectId(category),
                    subcategory: mongoose.Types.ObjectId(subcategory),
                    metaData,
                    metaDescription,
                },
                { new: true }
            );
        }
        return result;
    },
    delete: async (_id) => {
        var _id = mongoose.Types.ObjectId(_id);
        const result = await productsModel.deleteOne({ _id: _id });
        return result;
    },
    getMultipleProducts: async (ids) => {
        const list = await productsModel.find(
            { _id: { $in: ids } },
            { _id: 1, name: 1, thumbnail: 1, isFavourite: 1, variant: 1, title: 1 }
        );
        return list;
    },
    logSoldDealProduct: async (product, customerId) => {
        let currentDate = new Date(new Date().toLocaleDateString());
        var productLength = product.length;
        for (let i = 0; i < productLength; i++) {
            productId = product[i].productId;
            quantity = product[i].quantity;
            price = product[i].price;
            sku = product[i].sku;
            size = product[i].size;
            var dealProduct = await productsModel.findOne(
                { _id: productId, isDeal: true, dealExpire: { $gte: currentDate } },
                { dealExpire: 1 }
            );
            if (dealProduct) {
                productId = dealProduct._id;
                dealExpire = dealProduct.dealExpire;
                const dealData = new dealBuyerLogModel({
                    customer: customerId,
                    product: productId,
                    dealExpire: dealExpire,
                });
                await dealData.save();
            }
        }
    },
    updateLogDealProduct: async (customerId, product) => {
        const updatedDeals = [];

        for (const productItem of product) {
            const productId = productItem.productId;

            // Use updateOne to update a single document
            const deal = await dealBuyerLogModel.updateOne(
                { customer: customerId, product: productId },
                // Your update operation goes here
            );

            updatedDeals.push(deal);
        }

        return updatedDeals;
    }


    ,
    test: async () => {
        let data = await productsModel.find({});
        return data;
    },
    productCategory: async (categoryId) => {
        const result = await productsModel.find({
            category: { $in: categoryId },
        });
        return result;
    },
    productsubCategory: async (subCategoryId) => {
        const result = await productsModel.find({
            subcategory: { $in: subCategoryId },
        });
        return result;
    },
    calculateTax: async (product) => {
        const tax = await productsModel.aggregate([
            {
                $addFields: {
                    product: product,
                },
            },
            {
                $match: {
                    _id: "product.productId",
                },
            },
            {
                $project: {
                    totalTax: {
                        $multiply: ["$taxAmount", "$product.quantity"],
                    },
                },
            },
            {
                $group: {
                    _id: null,
                    totalTax: {
                        $sum: "$totalTax",
                    },
                },
            },
        ]);
        return tax;
    },
};

module.exports = productsServices;
