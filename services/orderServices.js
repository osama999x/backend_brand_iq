const orderModel = require("../model/orderModel");
const productModel = require("../model/productsModel");
const productLogModel = require("../model/productLogModel");
const projection = require("../config/mongoProjection");
const mongoose = require("mongoose");
const var_dump = require("var_dump");
const orderLogModel = require("../model/orderLogModel");
const orderStatusModel = require("../model/orderStatusModel");
const addToCartModel = require("../model/addToCartModel");
const pointModel = require("../model/pointModel");
const pointManageModel = require("../model/pointManageModel");
const dealBuyerLogModel = require("../model/dealBuyerLogModel");
const customerModel = require("../model/customerModel");
const membershipModel = require("../model/membershipModel");
const customerMembershipModel = require("../model/customerMembershipModel");
const sendEmailNotificationInfo = require("../utils/sendEmailNotficationInfo");
const sendNotificationEmail = require("../utils/sendNotificationEmail");
const { findOne } = require("../model/dealBuyerLogModel");
const coupanPolicyServices = require("./couponPolicyServices");
const { dealProduct } = require("../utils/sendEmailNotficationInfo");
const promotionModel = require("../model/promotionModel");
const pointServices = require("./pointServices");
const productLogServices = require("./productLogServices");
const productsServices = require("./productsServices");
const courierServices = require("./courierServices");
const orderLogService = require("../utils/orderLogService");
const orderServices = {
    generateRandomTrackingId: async () => {
        const randomId = Math.floor(Math.random() * 1000000000).toString().padStart(9, '0');
        return randomId;
    },
    orderTracking: async (orderId) => {
        let orderTrack = await orderLogModel.aggregate([
            {
                $match: {
                    orderId,
                },
            },
            {
                $lookup: {
                    from: "orderstatuses",
                    localField: "orderStatus",
                    foreignField: "_id",
                    as: "status",
                },
            },
            {
                $unwind: {
                    path: "$status",
                },
            },
            {
                $project: {
                    orderId: 1,
                    time: {
                        $dateToString: {
                            format: "%Y-%m-%d %H:%M:%S",
                            date: "$time",
                        },
                    },
                    status: "$status.orderStatusName",
                },
            },
        ]);

        return orderTrack;
    },
    orderDispatch: async (
        order,
        originCityCode,
        orderType,
        description,
        packing,
        weight,
        courierType
        // orderStatusType,
        // parcelId
    ) => {
        // var oldOrderStatus = order.status;
        totalBill = order.totalBill;
        var customerId = order.customer._id;
        product = order.product;
        redeemValue = order.redeemValue;
        couponCode = order.couponCode;
        let orderId = order._id;
        let secondOrderId = order.orderId;
        // let orderCourierType = order.courierType;
        // if (orderStatusType === "Delivered") {
        try {
            // const deliver =
            //     courierType === "POSTEX"
            //         ? await courierServices.createOrder(order, originCityCode, orderType)
            //         : await courierServices.swyftCreateOrder(
            //             order,
            //             originCityCode,
            //             packing,
            //             description,
            //             weight
            //         );
            // console.log("deliver: ", deliver);
            // const trackingId =
            //     courierType === "POSTEX"
            //         ? deliver.dist.trackingNumber
            //         : deliver.data.data[0].parcelId;
            const trackingId = await orderServices.generateRandomTrackingId();
            console.log("trackingId", trackingId)
            const courierType = "POSTEX";
            // if (deliver.statusCode === "200" || deliver.status === 200) {
            await Promise.all([
                orderLogService(courierType, "Delivered", orderId),
                orderServices.updateOrderStatus(
                    orderId,
                    "Delivered",
                    trackingId,
                    courierType,
                    true
                ),
            ]);
            //  const getPointPerOrder = await pointManageModel.findOne({ pointOrderPrice: { $lte: totalBill } });

            // const getPointPerOrder = await pointManageModel.findOne();
            const getPointPerOrder = await pointManageModel.findOne({
                pointOrderPriceTo: { $lte: totalBill },
                pointOrderPriceFrom: { $gte: totalBill }
            });
            console.log('getPointPerOrder', getPointPerOrder);
            if (getPointPerOrder) {
                //    const { pointOrderPrice, pointPerOrder } = getPointPerOrder;
                const { pointOrderPriceFrom, pointPerOrder } = getPointPerOrder;
                //Have to set As Per new modules Addtions now its Random
                console.log("totalBill:", totalBill);
                console.log("pointOrderPriceFrom:", pointOrderPriceFrom);
                console.log("pointPerOrder:", pointPerOrder);
                const point = Math.ceil(totalBill / pointOrderPriceFrom) * pointPerOrder;

                const data = new pointModel({
                    customer: customerId,
                    points: point,
                    orderId: secondOrderId,
                });
                await data.save();

                const updatedPoints = await customerModel.findByIdAndUpdate(
                    customerId,
                    { $inc: { points: point } },
                    { new: true }
                );

                if (updatedPoints) {
                    await pointServices.assaignPointMembership(
                        customerId,
                        updatedPoints.points + point
                    );
                }
            }
            // }
            return true;
        } catch (error) {
            throw new Error(error);
            // Handle errors
        }

        //update inventory status if order reject or cancel
        // else {
        //   try {
        //     let canceled;
        //     canceled =
        //       orderCourierType === "POSTEX"
        //         ? await courierServices.cancelOrder(parcelId)
        //         : await courierServices.swyftCancelOrder(parcelId);
        //     if (canceled.statusCode === "200" || canceled.status === 200) {
        //       const user = await customerModel.findById(
        //         { _id: customerId },
        //         { email: 1 }
        //       );
        //       email = user.email;
        //       let subject = sendEmailNotificationInfo.orderResponse.title;
        //       let text = `your order ${secondOrderId} has been Canceled due to some problem. Please try later!`;
        //       await Promise.all([
        //         orderServices.updateOrderStatus(orderId, "Canceled", null, null),
        //         //order logs
        //         orderLogService(courierType, "Canceled", orderId),
        //         //send mail to user
        //         sendNotificationEmail(subject, text, email),
        //         //update product inventory
        //         productLogServices.productLog(product, "Canceled", customerId),
        //         productsServices.updateLogDealProduct(product, customerId),
        //       ]);
        //       if (couponCode !== "00") {
        //         await coupanPolicyServices.refundCoupon(customerId, couponCode);
        //       }
        //       //update cutomer point that was consume in cancel or rejected order
        //       if (redeemValue > 0) {
        //         await customerModel.findOneAndUpdate(
        //           { _id: customerId },
        //           { $inc: { points: +redeemValue } }
        //         );
        //       }
        //       return true;
        //     }
        //   } catch (error) {
        //     console.log(error);
        //     throw new Error(error);
        //   }
        // }
    },
    orderCancel: async (order) => {
        console.log(order);
        totalBill = order.totalBill;
        var customerId = order.customer._id;
        product = order.product;
        redeemValue = order.redeemValue;
        couponCode = order.couponCode;
        let orderId = order._id;
        let secondOrderId = order.orderId;
        let orderCourierType = order.courierType;
        let parcelId = order.trackingId;
        try {
            let canceled;
            canceled =
                orderCourierType === "POSTEX"
                    ? await courierServices.cancelOrder(parcelId)
                    : await courierServices.swyftCancelOrder(parcelId);
            if (canceled.statusCode === "200" || canceled.status === 200) {
                const user = await customerModel.findById(
                    { _id: customerId },
                    { email: 1 }
                );
                email = user.email;
                let subject = sendEmailNotificationInfo.orderResponse.title;
                let text = `your order ${secondOrderId} has been Canceled due to some problem. Please try later!`;
                await Promise.all([
                    orderServices.updateOrderStatus(
                        orderId,
                        "Canceled",
                        null,
                        null,
                        false
                    ),
                    //order logs
                    orderLogService(orderCourierType, "Canceled", orderId),
                    //send mail to user
                    sendNotificationEmail(subject, text, email),
                    //update product inventory
                    productLogServices.productLog(product, "Canceled", customerId),
                    productsServices.updateLogDealProduct(product, customerId),
                ]);
                if (couponCode !== "00") {
                    await coupanPolicyServices.refundCoupon(customerId, couponCode);
                }
                //update cutomer point that was consume in cancel or rejected order
                if (redeemValue > 0) {
                    await customerModel.findOneAndUpdate(
                        { _id: customerId },
                        { $inc: { points: +redeemValue } }
                    );
                }
                return true;
            }
        } catch (error) {
            console.log(error);
            throw new Error(error);
        }
    },
    updateOrderStatus: async (
        orderId,
        status,
        trackingId,
        courierType,
        isDeliver
    ) => {
        const result = await orderModel.findOneAndUpdate(
            { _id: orderId },
            {
                status,
                trackingId,
                courierType,
                isDeliver,
            },
            { new: true }
        );
        return result;
    },
    customerOrderHistory: async (customerId) => {
        let result = await orderModel.aggregate([
            {
                $match: {
                    customer: new mongoose.Types.ObjectId(customerId),
                    isDeletedByUser: 0,
                },
            },
            {
                $addFields: {
                    firstProduct: {
                        $arrayElemAt: ["$product", 0],
                    },
                },
            },
            {
                $project: {
                    orderId: 1,
                    placedOn: 1,
                    firstProduct: 1,
                    status: 1,
                    trackingId: 1
                },
            },
            {
                $lookup: {
                    from: "products",
                    localField: "firstProduct.productId",
                    foreignField: "_id",
                    as: "product_info",
                },
            },
            {
                $unwind: {
                    path: "$product_info",
                },
            },
            {
                $project: {
                    orderId: 1,
                    placedOn: 1,
                    status: 1,
                    isDeliver: 1,
                    thumbnail: "$product_info.thumbnail",
                },
            },
            {
                $sort: {
                    placedOn: -1
                },
            },

        ]);

        // let result1 = await orderModel.aggregate([
        //     {
        //         $match: {
        //             _id: new mongoose.Types.ObjectId(result[0]._id),
        //             isDeletedByUser: 0,
        //         },
        //     },
        //     {
        //         $unwind: "$product"
        //     },
        //     {
        //         $lookup: {
        //             from: "products",
        //             localField: "product.productId",
        //             foreignField: "_id",
        //             as: "productDetails",
        //         },
        //     },
        //     {
        //         $unwind: "$productDetails"
        //     },
        //     {
        //         $lookup: {
        //             from: "categories",
        //             localField: "productDetails.category",
        //             foreignField: "_id",
        //             as: "categories",
        //         },
        //     },
        //     {
        //         $group: {
        //             _id: "$_id",
        //             paymentMode: { $first: "$paymentMode" },
        //             totalBill: { $first: "$totalBill" },
        //             tax: { $first: "$tax" },
        //             orderId: { $first: "$orderId" },
        //             trackingId: { $first: "$trackingId" },
        //             placedOn: { $first: "$placedOn" },
        //             isDeliver: { $first: "$isDeliver" },
        //             productThumbnail: { $first: "$productDetails.thumbnail" },
        //             products: {
        //                 $push: {
        //                     productId: "$productDetails._id",
        //                     quantity: "$product.quantity",
        //                     price: "$product.price",
        //                     sku: "$product.sku",
        //                     productCategory: { $first: "$categories.name" },
        //                     productName: "$productDetails.name",
        //                     productQuantity: "$product.quantity",
        //                     productPrice: "$product.price",
        //                 }
        //             },
        //         },
        //     },
        // ]);

        //   .find(
        //     {
        //       customer: { $in: customerId },
        //       isDeletedByUser: 0,
        //       isDeletedByAdmin: 0,
        //     },
        //     { orderId: 1, placedOn: 1, status: 1 }
        //   )
        //   .populate({
        //     path: "product.productId",
        //     select: { thumbnail: 1 },
        //   })
        //   .lean();
        // if (result.length != 0) {
        //   result = result.map((item) => {
        //     item.thumbnail = item.product[0].productId.thumbnail;
        //     delete item.product;
        //     return item;
        //   });
        // }

        // let result = await orderModel.aggregate([
        //     {
        //         $match: {
        //             customer: new mongoose.Types.ObjectId(customerId),
        //             isDeletedByUser: 0,
        //         },
        //     },
        //     {
        //         $lookup: {
        //             from: "products",
        //             localField: "product.productId",
        //             foreignField: "_id",
        //             as: "products_info",
        //         },
        //     },
        //     {
        //         $project: {
        //             customer: 1,
        //             "product._id": 1,
        //             "product.quantity": 1,
        //             "product.price": 1,
        //             "product.sku": 1,
        //             "product.size": 1,
        //             status: 1,
        //             totalBill: 1,
        //             totalAmount: 1,
        //             paymentMode: 1,
        //             orderId: 1,
        //             trackingId: 1,
        //             placedOn: 1,
        //             "products_info.thumbnail": 1
        //         },
        //     },
        //     {
        //         $sort: {
        //             placedOn: -1
        //         },
        //     }
        // ])
        return result;
    },
    getorder: async () => {
        const result = await orderModel
            .find(
                {
                    $or: [
                        {
                            $and: [
                                { status: { $ne: "Returned" } },
                                { isAdminReturn: { $eq: false } },
                            ],
                        },
                        {
                            $and: [
                                { status: { $eq: "Returned" } },
                                { isAdminReturn: { $eq: true } },
                            ],
                        },
                    ],
                },
                // {
                //   //isAdminReturn: { $ne: false },
                // },
                projection.orderprojection
            )
            .populate({
                path: "customer",
                select: { _id: 1, firstName: 1, lastName: 1 },
            }).sort({ createdAt: -1 });
        return result;
    },
    getOrderHistoryDetail: async (_id) => {
        let result = await orderModel.aggregate([
            {
                $match: {
                    _id: new mongoose.Types.ObjectId(_id),
                    isDeletedByUser: 0,
                },
            },
            {
                $unwind: "$product" // Unwind the product array to make it easier to use in $lookup stages
            },
            {
                $lookup: {
                    from: "products",
                    localField: "product.productId",
                    foreignField: "_id",
                    as: "productDetails",
                },
            },
            {
                $unwind: "$productDetails" // Unwind the productDetails array
            },
            {
                $lookup: {
                    from: "categories",
                    localField: "productDetails.category",
                    foreignField: "_id",
                    as: "categories",
                },
            },
            {
                $group: {
                    _id: "$_id",
                    paymentMode: { $first: "$paymentMode" },
                    totalBill: { $first: "$totalBill" },
                    tax: { $first: "$tax" },
                    orderId: { $first: "$orderId" },
                    status: { $first: "$status" },
                    trackingId: { $first: "$trackingId" },
                    placedOn: { $first: "$placedOn" },
                    isDeliver: { $first: "$isDeliver" },
                    productThumbnail: { $first: "$productDetails.thumbnail" },
                    products: {
                        $push: {
                            productId: "$productDetails._id",
                            quantity: "$product.quantity",
                            price: "$product.price",
                            sku: "$product.sku",
                            productCategory: { $first: "$categories.name" },
                            productName: "$productDetails.name",
                            productQuantity: "$product.quantity",
                            productPrice: "$product.price",
                            size: "$product.size",
                            colour: "$product.colour",
                        }
                    },
                },
            },
        ]);

        //   .findById(
        //     { _id },
        //     {
        //       placedOn: 1,
        //       orderId: 1,
        //       isDeliver: 1,
        //       trackingId: 1,
        //       paymentMode: 1,
        //       "product.quantity": 1,
        //       "product.price": 1,
        //       "product.sku": 1,
        //     }
        //   )
        //   .populate({
        //     path: "product.productId",
        //     select: { _id: 1, name: 1, thumbnail: 1 },
        //     populate: {
        //       path: "category",
        //       model: "Category",
        //     },
        //   })
        //   .lean();
        // if (result) {
        //   result.productThumbnail = result.product[0].productId.thumbnail;
        //   var list = result.product.map((item) => {
        //     item.productCategory = item.productId.category.name;
        //     item.productName = item.productId.name;
        //     item.productId = item.productId._id;
        //     item.productQuantity = item.quantity;
        //     item.productPrice = item.price;
        //     // delete item.productId;
        //     delete item.categoryId;
        //     return item;
        //   });
        //   result.product = list;
        // }
        // aggregate([
        //   {
        //     $match: { _id: mongoose.Types.ObjectId(_id) },
        //   },
        //   {
        //     $project: {
        //       placedOn: 1,
        //       status: 1,
        //       orderId: 1,
        //       trackingId: 1,
        //       "product.quantity": 1,
        //       "product.price": 1,
        //       "product.sku": 1,
        //       "product.productId": 1,
        //     },
        //   },
        //   {
        //     $lookup: {
        //       from: "products",
        //       localField: "product.productId",
        //       foreignField: "_id",
        //       as: "product.product",
        //     },
        //   },
        //   {
        //     $unwind: "$product.product",
        //   },
        //   {
        //     $lookup: {
        //       from: "categories",
        //       localField: "product.product.categoryId",
        //       foreignField: "_id",
        //       as: "product.product.category",
        //     },
        //   },
        //   {
        //     $unwind: "$product.product.category",
        //   },
        //   {
        //     $group: {
        //       _id: "$_id",
        //       placedOn: { $first: "$placedOn" },
        //       status: { $first: "$status" },
        //       orderId: { $first: "$orderId" },
        //       trackingId: { $first: "$trackingId" },
        //       product: {
        //         $push: {
        //           productId: "$product.product._id",
        //           productName: "$product.product.name",
        //           productThumbnail: "$product.product.thumbnail",
        //           productCategory: "$product.product.category.name",
        //           productQuantity: "$product.quantity",
        //           productPrice: "$product.price",
        //         },
        //       },
        //     },
        //   },
        //   {
        //     $project: {
        //       _id: "$_id",
        //       placedOn: 1,
        //       status: 1,
        //       orderId: 1,
        //       trackingId: 1,
        //       productThumbnail: { $arrayElemAt: ["$product.productThumbnail", 0] },
        //       product: {
        //         $map: {
        //           input: "$product",
        //           as: "item",
        //           in: {
        //             productId: "$$item.productId",
        //             productName: "$$item.productName",
        //             productCategory: "$$item.productCategory",
        //             productQuantity: "$$item.productQuantity",
        //             productPrice: "$$item.productPrice",
        //           },
        //         },
        //       },
        //     },
        //   },
        // ]);

        // aggregate([
        //   {
        //     $match: { _id: mongoose.Types.ObjectId(_id) },
        //   },
        //   {
        //     $project: {
        //       placedOn: 1,
        //       status: 1,
        //       orderId: 1,
        //       trackingId: 1,
        //       "product.quantity": 1,
        //       "product.price": 1,
        //       "product.sku": 1,
        //       "product.productId": 1,
        //     },
        //   },
        //   {
        //     $lookup: {
        //       from: "products",
        //       localField: "product.productId",
        //       foreignField: "_id",
        //       as: "product.product",
        //     },
        //   },
        //   {
        //     $unwind: "$product.product",
        //   },
        //   {
        //     $lookup: {
        //       from: "categories",
        //       localField: "product.product.categoryId",
        //       foreignField: "_id",
        //       as: "product.product.category",
        //     },
        //   },
        //   {
        //     $unwind: "$product.product.category",
        //   },
        //   {
        //     $group: {
        //       _id: "$_id",
        //       placedOn: { $first: "$placedOn" },
        //       status: { $first: "$status" },
        //       orderId: { $first: "$orderId" },
        //       trackingId: { $first: "$trackingId" },
        //       product: {
        //         $push: {
        //           productId: "$product.product._id",
        //           productName: "$product.product.name",
        //           productThumbnail: "$product.product.thumbnail",
        //           productCategory: "$product.product.category.name",
        //           productQuantity: "$product.quantity",
        //           productPrice: "$product.price",
        //         },
        //       },
        //     },
        //   },
        // ]);

        return result;
    },
    getOne: async (_id) => {
        const order = await orderModel
            .findById(
                { _id },
                {
                    address: 1,
                    contact: 1,
                    isDeliver: 1,
                    trackingId: 1,
                    city: 1,
                    status: 1,
                    totalBill: 1,
                    "product.sku": 1,
                    "product.size": 1,
                    "product.quantity": 1,
                    "product.price": 1,

                }
            )
            .populate({
                path: "customer",
            })
            .populate({
                path: "product.productId",
                select: { _id: 1, name: 1 },
                populate: [
                    {
                        path: "category",
                        model: "Category",
                        select: { _id: 1, name: 1 },
                    },
                    {
                        path: "subcategory",
                        model: "SubCategory",
                        select: { _id: 1, name: 1 },
                    },
                ],
            });
        console.log(order)
        return order;
    },
    customerOrder: async (_id) => {
        const order = await orderModel
            .findById({ _id }, projection.projection)
            .populate({
                path: "customer",
            });
        return order;
    },
    checkDealProduct: async (customer, product) => {
        const currentDate = new Date(new Date().toLocaleDateString());
        let errorMessages = [];

        for (let i = 0; i < product.length; i++) {
            const { productId, quantity, price, sku, size } = product[i];
            const Product = await productModel.findOne(
                { _id: productId },
                {
                    variant: { $elemMatch: { sku } },
                    name: 1,
                    discount: 1,
                    dealExpire: 1,
                    isDeal: 1,
                }
            );

            // if (!Product || !Product.variant.length) {
            //     console.log(1)

            //     throw { message: { msg: `Product Doesn't Exist` } };
            // }

            // if (quantity > Product.variant[0].quantity) {
            //     console.log(2)

            //     throw { message: { msg: `ProductID: ${Product._id} & ${Product.name} has not Enough Quantity! Available Quantity : ${Product.variant[0].quantity}` } };
            // }
            if (!Product || !Product.variant.length) {
                errorMessages.push({ msg: `ProductID: ${productId} & ${Product.name} doesn't exist`, productId: productId, sku: Product.variant[0].sku });
                console.log(1)

                continue;
            }

            if (quantity > Product.variant[0].quantity) {
                errorMessages.push({
                    productId: productId,
                    ProductName: Product.name,
                    AvailableQuantity: Product.variant[0].quantity,
                    sku: Product.variant[0].sku,
                    msg: `Out of Stock`,
                });
                console.log(2);
                continue; // Continue to the next product
            }

            if (Product.isDeal) {
                console.log(3)

                if (Product.dealExpire >= currentDate) {
                    console.log(4)

                    if (price !== Product.variant[0].actualPrice - Product.discount) {
                        console.log(5)

                        throw {
                            message: {
                                msg: `${Product.name} price has been changed, update the cart!`,
                            },
                        };
                    }

                    const buy = await dealBuyerLogModel.findOne({
                        customer,
                        product: productId,
                    });

                    if (buy) {
                        console.log(6)

                        throw {
                            message: {
                                msg: `You already bought this deal product, remove ${Product.name} from the cart!`,
                            },
                        };
                    }
                } else {
                    console.log(7)

                    throw {
                        message: {
                            msg: `Deal expired, remove ${Product.name} from the cart!`,
                        },
                    };
                }
            }
            console.log(11)

            const checkPromotion = await promotionModel.findOne({
                product: { $in: productId },
                expireDate: { $gte: currentDate },
                status: "active"
            });

            if (checkPromotion) {
                console.log(12)
                const promotiondiscount = Product.variant[0].actualPrice -
                    (Product.variant[0].actualPrice * checkPromotion.discount) / 100
                if (
                    price !== promotiondiscount

                ) {
                    console.log(13);

                    throw {
                        message: {
                            msg: `${Product.name} is in Promotion.`,
                            productId: productId,
                            discount: promotiondiscount
                        },
                    };
                }
            }
            // else {
            //     console.log(14)

            //     // Product is not in promotion
            //     if (Product.variant[0].isDiscount) {
            //         // Product variant has a discount
            //         console.log(15)

            //         if (price !== Product.variant[0].discountedPrice) {
            //             console.log(16)

            //             throw {
            //                 message: {
            //                     msg: `${Product.name} price has been changed, update the cart!`,
            //                 },
            //             };
            //         }
            //     } else {
            //         console.log(17)

            //         // Product variant has no discount, check against actual price
            //         if (price !== Product.variant[0].actualPrice) {
            //             console.log(18)

            //             throw {
            //                 message: {
            //                     msg: `${Product.name} price has been changed, update the cart!`,
            //                 },
            //             };
            //         }
            //     }
            // } commented just for now
            // console.log(Product.variant[0])
            else if (Product.variant[0].isDiscount || Product.variant[0].discountedPrice) {
                console.log(8)

                // console.log({ price, discountedPrice: Product.variant[0].discountedPrice });

                if (price !== Product.variant[0].discountedPrice) {
                    console.log(9)

                    throw {
                        message: {
                            msg: `${Product.name} Price has been changed, update the Cart!`,
                            Name: Product.name,
                            discount: Product.variant[0].discountedPrice,
                        },
                    };
                }
            } else if (price !== Product.variant[0].actualPrice) {
                console.log(10)

                throw {
                    message: {
                        msg: `${Product.name} price has been changed, update the Cart!`,
                    },
                };
            }
        }
        if (errorMessages.length > 0) {
            // If there are any error messages, throw them as a combined message
            throw { message: { data: errorMessages } };
        }




        // var currentDate = new Date(new Date().toLocaleDateString());
        // var productLength = product.length;
        // for (let i = 0; i < productLength; i++) {
        //   productId = product[i].productId;
        //   quantity = product[i].quantity;
        //   price = product[i].price;
        //   sku = product[i].sku;
        //   size = product[i].size;
        //   var Product = await productModel.findOne(
        //     { _id: productId },
        //     {
        //       variant: {
        //         $elemMatch: { sku: sku },
        //       },
        //       name: 1,
        //       discount: 1,
        //       dealExpire: 1,
        //       isDeal: 1,
        //       isDiscount: 1,
        //     }
        //   );
        //   //cehck product availability
        //   if (Product && Product.variant.length != 0) {
        //     //check product quantity meet the user requirements
        //     if (quantity > Product.variant[0].quantity) {
        //       const result = {
        //         message: {
        //           msg: `sorry ${Product.name} availble quantity don't meet your requirements!`,
        //         },
        //       };
        //       throw result;
        //     } else {
        //       //check product deal and check price
        //       if (
        //         Product.isDeal === true &&
        //         price === Product.variant[0].actualPrice - Product.discount
        //       ) {
        //         if (Product.dealExpire >= currentDate) {
        //           let buy = await dealBuyerLogModel.findOne({
        //             customer: customer,
        //             product: productId,
        //           });
        //           if (buy) {
        //             const result = {
        //               message: {
        //                 msg: `You are already bought this product with deal price. Please remove ${Product.name} from the cart!`,
        //               },
        //             };
        //             throw result;
        //           } else {
        //             continue;
        //           }
        //         } else {
        //           const result = {
        //             message: {
        //               msg: `Deal expire .Please remove ${Product.name} from the cart!`,
        //             },
        //           };
        //           throw result;
        //         }
        //       }
        //       //check product deal but not match the price
        //       else if (
        //         Product.isDeal === true &&
        //         price != Product.variant[0].actualPrice - Product.discount
        //       ) {
        //         const result = {
        //           message: {
        //             msg: `${Product.name} price has been changed please update the cart!`,
        //           },
        //         };
        //         throw result;
        //       }
        //       //check product in discount but not match the price
        //       else if (
        //         Product.isDiscount === true &&
        //         price != Product.variant[0].discountedPrice
        //       ) {
        //         const result = {
        //           message: {
        //             msg: `${Product.name} price has been changed please update the cart!`,
        //           },
        //         };
        //         throw result;
        //       }
        //       //check if product not in deal and discount then check promotion availability on product
        //       else if (Product.isDeal === false && Product.isDiscount === false) {
        //         const checkPromotion = await promotionModel.findOne({
        //           product: { $in: productId },
        //           expireDate: { $gte: currentDate },
        //         });
        //         if (
        //           checkPromotion &&
        //           price !=
        //             Product.variant[0].actualPrice -
        //               (Product.variant[0].actualPrice / 100) *
        //                 checkPromotion.discount
        //         ) {
        //           const result = {
        //             message: {
        //               msg: `Promotion expire please update the cart or ${Product.name} remove from the cart!`,
        //             },
        //           };
        //           throw result;
        //         }
        //         //check if product not in promotion but not match the price with actual price of product
        //         else if (
        //           !checkPromotion &&
        //           price != Product.variant[0].actualPrice
        //         ) {
        //           const result = {
        //             message: {
        //               msg: `${Product.name} price has been changed please update the cart!`,
        //             },
        //           };
        //           throw result;
        //         }
        //       }
        //     }
        //   }
        //   //if product or variant not in stock
        //   else {
        //     const result = {
        //       message: {
        //         msg: `Sorry some cart product not in stok right now!`,
        //       },
        //     };
        //     throw result;
        //   }
        // }
    },
    add: async (
        customer,
        product,
        paymentMode,
        totalBill,
        totalAmount,
        redeemValue,
        orderId,
        channel,
        couponCode,
        tax,
        billingAddress,
        shippingAddress
    ) => {
        try {
            var productArr = [];
            var currentDate = new Date(new Date().toLocaleString());
            var productLength = product.length;

            for (let i = 0; i < productLength; i++) {
                const productId = product[i].productId;
                const quantity = product[i].quantity;
                const price = product[i].price;
                const sku = product[i].sku;
                // const size = product[i].size;
                // const colour = product[i].colour;

                const Product = await productModel.findOne(
                    { _id: productId },
                    {
                        variant: {
                            $elemMatch: { sku: sku },
                            name: 1,
                            discount: 1,

                        },
                    }
                );

                if (!Product || !Product.variant || Product.variant.length === 0) {
                    continue;
                }


                const variant = Product.variant[0];
                console.log("variant", variant);

                const variantSize = variant.size || "";
                const variantColour = variant.colorName || "";

                const productInfo = {
                    productId: productId,
                    quantity: quantity,
                    price: price,
                    sku: sku,
                    size: variantSize,
                    colour: variantColour,
                };


                productArr.push(productInfo);
            }


            // //check customer already buy deal product or not
            // var productArr = [];
            // var currentDate = new Date(new Date().toLocaleString());
            // var productLength = product.length;
            // for (let i = 0; i < productLength; i++) {
            //     productId = product[i].productId;
            //     quantity = product[i].quantity;
            //     price = product[i].price;
            //     sku = product[i].sku;
            //     size = product[i].size;
            //     //   if (price <= 0) {
            //     //     return;
            //     //   }
            //     var Product = await productModel.findOne(
            //         { _id: productId, isDeal: true },
            //         {
            //             variant: {
            //                 $elemMatch: { sku: sku },
            //                 name: 1,
            //                 discount: 1,
            //                 dealExpire: 1,
            //             },
            //         }
            //     );
            // }
            //   if (
            //     Product != null &&
            //     price === Product.variant[0].actualPrice - Product.discount
            //   ) {
            //     if (Product.dealExpire >= currentDate) {
            //       let buy = await dealBuyerLogModel.findOne({
            //         customer: customer,
            //         product: productId,
            //       });
            //       if (buy) {
            //         const result = {
            //           message: {
            //             msg: `You are already bought this product with deal price. Please remove ${Product.name} from the cart!`,
            //           },
            //         };
            //         throw result;
            //       } else {
            //         productArr.push({
            //           productId: mongoose.Types.ObjectId(productId),
            //           quantity: quantity,
            //           price: price,
            //           sku: sku,
            //           size: size,
            //         });
            //       }
            //     } else {
            //       const result = {
            //         message: {
            //           msg: `Deal expire .Please remove ${Product.name} from the cart!`,
            //         },
            //       };
            //       throw result;
            //     }
            //   } else {
            //     productArr.push({
            //       productId: mongoose.Types.ObjectId(productId),
            //       quantity: quantity,
            //       price: price,
            //       sku: sku,
            //       size: size,
            //     });
            //   }
            // }
            var order = new orderModel({
                customer: mongoose.Types.ObjectId(customer),
                product: productArr,
                paymentMode,
                totalBill,
                totalAmount,
                redeemValue,
                orderId,
                placedOn: currentDate,
                channel,
                couponCode,
                tax,
                billingAddress,
                shippingAddress
            });
            //ORDER PLACED
            var result = await order.save();
            var customerId = result.customer;
            orderId = result.orderId;
            console.log("result", result);
            var Result = {
                _id: result._id,
                orderId: result.orderId,
            };
            console.log("Result", Result);
            if (result) {
                let subject = sendEmailNotificationInfo.orderResponse.title;
                let text =
                    sendEmailNotificationInfo.orderResponse.body +
                    `Your Order has been SuccesFully Placed on Msafa and your Order Id: ${Result.orderId}, Total Bill ${Result.totalBill}, PlacedOn: ${Result.placedOn}. Happy Shopping :)`;
                let userEmail = await customerModel.findOne(
                    { _id: customerId },
                    { email: 1, _id: 0 }
                );
                if (userEmail) {
                    await sendNotificationEmail(subject, text, userEmail.email);
                }
                //consume Customer Coupon
                if (result.couponCode) {
                    coupanPolicyServices.consumeCoupon(customerId, result.couponCode);
                }
                //UPDATE PRODUCT QUANTITY
                await productLogServices.productLog(product, "SOLD", customerId);

                // var productLength = result.product.length;
                // for (let i = 0; i < productLength; i++) {
                //   productId = product[i].productId;
                //   quantity = product[i].quantity;
                //   price = product[i].price;
                //   sku = product[i].sku;
                //   size = product[i].size;
                //   const filter = { _id: productId, "variant.sku": sku };
                //   const update = { $inc: { "variant.$.quantity": -quantity } };
                //   //Log the Sales Product
                //   await productModel.findOneAndUpdate(filter, update);
                //   productLog = new productLogModel({
                //     product: mongoose.Types.ObjectId(productId),
                //     description: `SOLD,PRODUCTID:${productId},SKU:${sku},QUANTITY:${quantity},PRICE:${price},CUSTOMER:${customer},Size:${size}`,
                //   });
                //   await productLog.save();

                //save customer logs if he buy deal product
                await productsServices.logSoldDealProduct(product, customerId);
                if (redeemValue > 0) {
                    await pointServices.updateCustomerRedeemPoints(
                        customerId,
                        redeemValue
                    );
                }
                //Order Placed Then Clear Add to cart History
                if (result.channel === "Web View") {
                    await addToCartModel.deleteOne({ customer: { $in: customerId } });
                }
            }

            return Result;
        } catch (e) {
            console.log(e);
        }
    },
    customerClearHistory: async (customer) => {
        const result = await orderModel.updateMany(
            { customer, isDeletedByUser: 0 },
            { $set: { isDeletedByUser: 1 } },
            { new: true }
        );
        return result;
    },
    orderReport: async (startDate, endDate) => {
        let matchQuery = {
            status: { $in: ["Delivered", "Returned"] },
        };

        if (startDate && endDate) {
            matchQuery.placedOn = {
                $gte: new Date(startDate),
                $lt: new Date(endDate),
            };
        } else if (startDate) {
            matchQuery.placedOn = {
                $gte: new Date(startDate),
                $lte: endDate ? new Date(endDate) : new Date(),
            };
        }

        let result = await orderModel.aggregate([
            {
                $match: matchQuery,
            },
            {
                $group: {
                    _id: {
                        year: { $year: "$placedOn" },
                        month: { $month: "$placedOn" },
                        status: "$status",
                    },
                    order: { $sum: 1 },
                },
            },
            {
                $project: {
                    year: "$_id.year",
                    month: "$_id.month",
                    status: "$_id.status",
                    order: 1,
                },
            },
        ]);

        if (result.length === 0) {
            result = [
                {
                    year: new Date().getFullYear(),
                    month: new Date().getMonth() + 1, // Add 1 to represent the actual month
                    status: "Delivered",
                    totalDelivered: 0,
                },
                {
                    year: new Date().getFullYear(),
                    month: new Date().getMonth() + 1, // Add 1 to represent the actual month
                    status: "Returned",
                    totalReturned: 0,
                },
            ];
        } else {
            result = result.map(({ year, month, status, order }) => ({
                year,
                month,
                status,
                total: order,
            }));
        }

        result.push({
            totalOrder: await orderModel.countDocuments(matchQuery),
        });

        return result;
    }


    ,
    orderReportByChannel: async () => {
        let result = await orderModel.aggregate([
            {
                $group: {
                    _id: {
                        year: { $year: "$placedOn" },
                        month: { $month: "$placedOn" },
                        channel: "$channel",
                    },
                    order: { $sum: 1 },
                },
            },
        ]);

        if (result.length === 0) {
            result = [
                {
                    year: new Date().getFullYear(),
                    month: new Date().getMonth(),
                    channel: "",
                    order: 0,
                },
            ];
        } else {
            result = result.map(({ _id, order }) => ({
                year: _id.year,
                month: _id.month,
                channel: _id.channel,
                order,
            }));
        }

        result.push({
            totalOrder: await orderModel.countDocuments(),
        });

        return result;
    },
    dashboard: async () => {
        let result = await orderModel
            .aggregate([
                {
                    $group: {
                        _id: "$status",
                        count: { $sum: 1 },
                    },
                },
            ])
            .sort({ createdAt: 1 });

        var totalOrder = 0;

        if (result.length !== 0) {
            for (var i of result) {
                totalOrder += i.count;
            }

            result = result.map((item) => {
                item.status = item._id;
                item.order = item.count;
                delete item._id;
                delete item.count;
                return item;
            });
        }

        const statusList = ["Pending", "Delivered", "Returned"];

        // Add missing status with count 0
        for (const status of statusList) {
            const existingStatus = result.find((item) => item.status === status);
            if (!existingStatus) {
                result.push({
                    status: status,
                    order: 0,
                });
            }
        }

        const total = {
            totalOrder: totalOrder,
        };
        result.push(total);

        return result;
    }
    ,
    // delete: async (_id) => {
    //   var _id = mongoose.Types.ObjectId(_id);
    //   const result = await orderModel.deleteOne({ _id });
    //   return result;
    // },
    popReturnProduct: async (orderId, returnProduct) => {
        var totalPrice = 0;
        var returnProductLength = returnProduct.length;
        for (let i = 0; i < returnProductLength; i++) {
            productId = returnProduct[i].productId;
            quantity = returnProduct[i].quantity;
            price = returnProduct[i].price;
            sku = returnProduct[i].sku;
            size = returnProduct[i].size;
            totalPrice += price * quantity;
            const order = await orderModel.updateOne(
                { _id: orderId },
                {
                    $pull: { product: { productId: productId, sku: sku } },
                    status: "Delivered",
                },
                { new: true }
            );
            const filter = { _id: productId, "variant.sku": sku };
            const update = { $inc: { "variant.$.quantity": +quantity } };
            await productModel.findOneAndUpdate(filter, update);
            productLog = new productLogModel({
                product: mongoose.Types.ObjectId(productId),
                description: `return product,PRODUCTID:${productId},SKU:${sku},QUANTITY:${quantity},PRICE:${price},CUSTOMER:${order.customer},Size:${size}`,
            });
            await productLog.save();
        }
        console.log("totalPrice", totalPrice);
        return totalPrice;
    },
    findOrder: async (orderId) => {
        const order = await orderModel.findById({ _id: orderId });
        return order;
    },
    orderPayment: async (orderId) => {
        const payment = await orderModel.findOneAndUpdate(
            { _id: orderId },
            { payment: true },
            { new: true }
        );
        return payment;
    },
    orderProduct: async (customer, product) => {
        const result = await orderModel.findOne({
            customer,
            "product.productId": product,
        });
        return result
    },
};

module.exports = orderServices;
