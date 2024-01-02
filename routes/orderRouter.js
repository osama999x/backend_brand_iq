const express = require("express");
const expressAsyncHandler = require("express-async-handler");
const mongoose = require("mongoose");
const customerModel = require("../model/customerModel");
const { findById } = require("../model/dealBuyerLogModel");
const orderServices = require("../services/orderServices");
const systemNotificationServices = require("../services/systemNotificationServices");
const notificationInfo = require("../utils/notificationInfo");
const dealProductModel = require("../model/dealsProductModel");
const orderRouter = express.Router();
const orderModel = require("../model/orderModel");
const convertDate = require("../utils/convertDate");
const paymentHistoryService = require("../services/paymentHistoryServices");
const zindigiWalletServices = require("../services/zindigiWalletServices");
const zindigiWalletPayment = require("../utils/zindigiWalletPayment");
const validateMobileNumber = require("../utils/validateMobileNumber");
const { log } = require("winston");

orderRouter.get(
    "/orderTracking",
    expressAsyncHandler(async (req, res) => {
        const { orderId } = req.query;
        const result = await orderServices.orderTracking(orderId);
        if (result.length != 0) {
            return res.status(200).send({
                msg: "Orders Track History",
                data: result,
            });
        } else {
            return res.status(400).send({ msg: "Order Not Track" });
        }
    })
);
orderRouter.post(
    "/orderDispatch",
    expressAsyncHandler(async (req, res) => {
        const {
            orderId,
            // originCityCode,
            orderType,
            description,
            packing,
            weight,
            //courierType,
        } = req.body;
        if (
            !orderId ||
            //!originCityCode ||
            !orderType ||
            !description ||
            !packing ||
            !weight
            //!courierType
        ) {
            return res.status(400).send({
                msg: "Fields Missing",
            });
        }
        console.log(req.body, "Request");
        // if (
        //   orderStatusType === "Canceled" &&
        //   (!orderId || !parcelId || !orderStatusType)
        // ) {
        //   return res.status(400).send({
        //     msg: "Fields Missing",
        //   });
        // }
        const order = await orderServices.customerOrder(orderId);
        // if (
        //   orderStatusType === "Canceled" &&
        //   (!order || (order.status !== "Delivered" && order.status !== "Canceled"))
        // ) {
        //   return res.status(400).send({
        //     msg: "You can't proceed this order with given instruction",
        //   });
        // }
        if (
            //orderStatusType === "Delivered" &&
            !order ||
            (order.status !== "Pending" && order.status !== "Canceled")
        ) {
            return res.status(400).send({
                msg: "You can't proceed this order with given instruction",
            });
        }
        let originCityCode = "002";
        let courierType = "POSTEX";
        const result = await orderServices.orderDispatch(
            order,
            originCityCode,
            orderType,
            description,
            packing,
            weight,
            courierType
        );
        if (result) {
            return res.status(200).send({
                msg: "Orders delivered Successfully ",
            });
        } if (!result) {
            return res.status(400).send({ msg: "Failed!" });
        }
    })
);
orderRouter.get(
    "/orderCancel",
    expressAsyncHandler(async (req, res) => {
        const { orderId } = req.query;
        if (!orderId) {
            return res.status(400).send({
                msg: "Fields Missing",
            });
        }
        const order = await orderServices.customerOrder(orderId);
        if (
            !order ||
            (order.status !== "Delivered" && order.status !== "Canceled") ||
            !order.isDeliver !== false
        ) {
            return res.status(400).send({
                msg: "You can't proceed this order with given instruction",
            });
        }
        const result = await orderServices.orderCancel(order);
        if (result) {
            return res.status(200).send({
                msg: "Orders canceled Successfully ",
            });
        } else {
            return res.status(400).send({ msg: "Failed!" });
        }
    })
);
orderRouter.get(
    "/all",
    expressAsyncHandler(async (req, res) => {
        const result = await orderServices.getorder();
        res.status(200).send({
            msg: "Orders Details",
            data: result,
        });
    })
);
orderRouter.get(
    "/customerOrderHistory",
    expressAsyncHandler(async (req, res) => {
        const { customerId } = req.query;
        const result = await orderServices.customerOrderHistory(customerId);
        if (result.length != 0) {
            return res.status(200).send({
                msg: "Customer Order History",
                data: result,
            });
        } else {
            return res
                .status(400)
                .send({ msg: "Customer Order History Not Found", data: result });
        }
    })
);
orderRouter.get(
    "/orderHistoryDetail",
    expressAsyncHandler(async (req, res) => {
        const { orderId } = req.query;
        const result = await orderServices.getOrderHistoryDetail(orderId);
        if (result) {
            return res.status(200).send({
                msg: "Customer Order History Detail",
                data: result,
            });
        } else {
            return res
                .status(400)
                .send({ msg: "Customer Order History Detail Not Found", data: result });
        }
    })
);
orderRouter.get(
    "/customerClearHistory",
    expressAsyncHandler(async (req, res) => {
        const { customerId } = req.query;
        const result = await orderServices.customerClearHistory(customerId);
        if (result.length != 0) {
            return res.status(200).send({
                msg: "Customer History Cleared",
            });
        } else {
            return res.status(400).send({ msg: "Customer History Not Cleared" });
        }
    })
);
orderRouter.get(
    "/detail",
    expressAsyncHandler(async (req, res) => {
        const { orderId } = req.query;
        const result = await orderServices.getOne(orderId);
        if (result) {
            return res.status(200).send({
                msg: "Order Details",
                data: result,
            });
        } else {
            return res.status(400).send({ msg: "order Not Found" });
        }
    })
);
orderRouter.post(
    "/checkProductAvailbilty",
    expressAsyncHandler(async (req, res) => {
        const { customer, product } = req.body;
        console.log(product)
        if (!customer || product.length === 0) {
            return res.status(400).send({ msg: "Fields Missing" });
        }
        try {
            const result = await orderServices.checkDealProduct(customer, product);
            return res.status(200).send({ validate: true });
        } catch (e) {
            console.log(e.message)
            return res.status(400).send(e.message);
        }
    })
);
orderRouter.post(
    "/",
    expressAsyncHandler(async (req, res) => {
        var {
            customer,
            product,
            paymentMode,
            totalBill,
            totalAmount,
            redeemValue,
            address,
            city,
            contact,
            channel,
            couponCode,
            tax,
        } = req.body;
        if (!city) {
            city = "Islamabad";
        }
        if (!customer || !product || !paymentMode || !totalBill) {
            return res.status(400).send({ msg: "Fields Missing" });
        }
        const isValidContact = validateMobileNumber(contact);
        if (!isValidContact) {
            return res.status(400).send({
                msg: "Please enter valid contact number 03xxxxxxxxx!",
            });
        }
        try {
            let orderId = Math.floor(Math.random() * 100000 + 100000)
                .toString()
                .substring(1);
            // orderId = genOrderId;
            // }
            // let trackingId = Math.floor(Math.random() * 100000 + 100000)
            //   .toString()
            //   .substring(1);
            // trackingId = `MSAFA-${trackingId}`;
            if (paymentMode === "zindigi") {
                const user = await customerModel.findOne({ _id: customer });

                if (!user) {
                    res.status(400).send({ msg: "User Not Found!" });
                }
                let mobileNo = contact;
                // let mobileNo = convertMobileFormate(user.contact);
                let dateTime = convertDate(new Date(new Date().toLocaleString()));
                console.log("date", dateTime);
                console.log("totalbill", totalBill);
                // let amount = totalBill;
                const zindigiPymentResult = await zindigiWalletPayment.payment(
                    dateTime,
                    mobileNo,
                    totalBill
                );
                console.log("zindigipament", zindigiPymentResult);

                if (!zindigiPymentResult) {
                    return res.status(400).send({
                        msg: "Unknown error occur!",
                    });
                }
                if (zindigiPymentResult.ResponseCode === 0o0) {
                    // Place the order
                    let orderResult = await orderServices.add(
                        customer,
                        product,
                        paymentMode,
                        totalBill,
                        totalAmount,
                        redeemValue,
                        address,
                        city,
                        contact,
                        orderId,
                        channel,
                        couponCode,
                        tax
                    );
                    if (orderResult) {
                        let customerFcm = await customerModel.findOne(
                            { _id: customer },
                            { fcmToken: 1 }
                        );
                        if (customerFcm.fcmToken !== null) {
                            await systemNotificationServices.newNotification(
                                notificationInfo.orderResponse.body,
                                notificationInfo.orderResponse.title,
                                customerFcm.fcmToken
                            );
                        }
                        console.log("orderId///////////////////////////////////////////////", orderResult._id);
                        const history = await paymentHistoryService.new(
                            customer,
                            orderResult._id,
                            "zindigi",
                            zindigiPymentResult
                        );
                        await orderModel.findOneAndUpdate(
                            { _id: orderResult._id },
                            { payment: true },
                            { new: true }
                        );
                        return res
                            .status(200)
                            .send({ msg: "Order Placed Successfully.", data: orderResult });
                    } else {
                        return res.status(400).send({ msg: "Order Not Placed" });
                    }
                    //  console.log(history);
                    // res.status(200).send({ msg: result.ResponseDescription });
                } else {
                    return res
                        .status(403)
                        .send({ msg: zindigiPymentResult.ResponseDescription });
                }
            } else {
                const result = await orderServices.add(
                    customer,
                    product,
                    paymentMode,
                    totalBill,
                    totalAmount,
                    redeemValue,
                    address,
                    city,
                    contact,
                    orderId,
                    channel,
                    couponCode,
                    tax
                );
                if (result) {
                    res
                        .status(200)
                        .send({ msg: "Order Placed Successfully.", data: result });
                    const customerFcm = await customerModel.findOne(
                        { _id: customer },
                        { fcmToken: 1 }
                    );

                    await systemNotificationServices.newNotification(
                        notificationInfo.orderResponse.body,
                        notificationInfo.orderResponse.title,
                        customerFcm.fcmToken
                    );
                } else {
                    return res.status(400).send({ msg: "Order Not Placed" });
                }
            }
        } catch (e) {
            if (typeof e.message == "String") {
                res.status(500).send({ msg: e.message });
                return;
            }
            return res.status(400).send(e.message);
        }
    })
);
orderRouter.get(
    "/orderReport",
    expressAsyncHandler(async (req, res) => {
        //const { month } = req.body;
        const result = await orderServices.orderReport();
        if (result.length != 0) {
            return res.status(200).send({
                msg: "Orders Details",
                data: result,
            });
        } else {
            return res.status(400).send({ msg: "Order Not Found" });
        }
    })
);
orderRouter.get(
    "/orderReportByChannel",
    expressAsyncHandler(async (req, res) => {
        //const { month } = req.body;
        const result = await orderServices.orderReportByChannel();
        if (result.length != 0) {
            return res.status(200).send({
                msg: "Orders Details",
                data: result,
            });
        } else {
            return res.status(400).send({ msg: "order Not Found" });
        }
    })
);
orderRouter.get(
    "/dashboard",
    expressAsyncHandler(async (req, resp) => {
        const result = await orderServices.dashboard();
        if (result.length != 0) {
            resp.status(200).send({
                msg: "Order Detials",
                data: result,
            });
        } else {
            resp.status(400).send({
                msge: " Not Found",
            });
        }
    })
);

//ok
orderRouter.get(
    '/hotSellingProducts',
    expressAsyncHandler(async (req, res, next) => {
        try {
            const currentMonth = new Date().getMonth() + 1; // Months are zero-based, so add 1

            const result = await orderModel.aggregate([
                {
                    $match: {
                        // Filter orders placed in the current month
                        createdAt: {
                            $gte: new Date(new Date().getFullYear(), currentMonth - 1, 1),
                            $lt: new Date(new Date().getFullYear(), currentMonth, 1),
                        },
                    },
                },
                {
                    $unwind: '$product',
                },
                {
                    $group: {
                        _id: '$product.productId',
                        count: { $sum: '$product.quantity' },
                    },
                },
                {
                    $lookup: {
                        from: 'Product', // Assuming your Product model is named 'Product'
                        localField: '_id',
                        foreignField: '_id',
                        as: 'productDetails',
                    },
                },
                {
                    $unwind: '$productDetails',
                },
                {
                    $project: {
                        _id: 1,
                        productName: '$productDetails.name',
                        count: 1,
                    },
                },
                {
                    $sort: { count: -1 },
                },
                {
                    $limit: 5,
                },
            ]);
            console.log(result);
            if (result.length !== 0) {
                res.status(200).json({
                    success: true,
                    message: 'Hot Selling Products',
                    data: result,
                });
            } else {
                res.status(404).json({
                    success: false,
                    message: 'No Hot Selling Products Found',
                });
            }
        } catch (error) {
            console.error(error);
            next(error);
        }
    })
);

//End



// orderRouter.patch(
//   "/",
//   expressAsyncHandler(async (req, res) => {
//     const { orderId, customer, product, paymentMode } = req.body;
//     if (!orderId || !customer || !product || !paymentMode) {
//       return res.status(400).send({ msg: "Fields Missing" });
//     }
//     const result = await orderServices.update(
//       orderId,
//       customer,
//       product,
//       paymentMode
//     );
//     if (result) {
//       return res.status(200).send({ msg: "order updated.", data: result });
//     } else {
//       return res.status(400).send({ msg: "order not updated" });
//     }
//   })
// );
// orderRouter.delete(
//   "/",
//   expressAsyncHandler(async (req, res) => {
//     const { orderId } = req.body;
//     const result = await orderServices.delete(orderId);
//     if (result.deletedCount == 0) {
//       return res.status(400).send({ msg: "ID Not found" });
//     }
//     if (result) {
//       return res.status(200).send({ msg: "order deleted.", data: result });
//     } else {
//       return res.status(400).send({ msg: "order not deleted" });
//     }
// }
// )
//);

module.exports = orderRouter;
