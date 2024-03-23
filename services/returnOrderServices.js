const mongoose = require("mongoose");
const returnOrderModel = require("../model/returnOrderModel");
const projection = require("../config/mongoProjection");
const uploadFile = require("../utils/uploadd");
const orderModel = require("../model/orderModel");
const productModel = require("../model/productsModel");
const orderLogModel = require("../model/orderLogModel");
const orderStatusModel = require("../model/orderStatusModel");
const pointModel = require("../model/pointModel");
const customerModel = require("../model/customerModel");
const pointServices = require("./pointServices");
const productsModel = require("../model/productsModel");
const productLogModel = require("../model/productLogModel");
const sendEmailNotificationInfo = require("../utils/sendEmailNotficationInfo");
const sendNotificationEmail = require("../utils/sendNotificationEmail");
const pointManageModel = require("../model/pointManageModel");
const returnOrderStatusLogModel = require("../model/returnOrderStatusLogModel");
const orderStatusServices = require("./orderStatusServices");
const productLogServices = require("./productLogServices");
const orderServices = require("./orderServices");
const productsServices = require("./productsServices");

const returnOrderServices = {
    //request to exchange order or return order
    exchangeOrder: async (
        orderId,
        isOrderReturn,
        shipmentType,
        returnProduct,
        exchangeReason,
        images
    ) => {
        let imgArr = [];
        if (images) {
            var uploadedImages = await uploadFile(images);
            console.log(uploadedImages);


        }

        // var productArr = [];
        // var currentDate = new Date(new Date().toLocaleString());
        // var productLength = returnProduct.length;
        // //console.log("productLength", productLength);
        // for (let i = 0; i < productLength; i++) {
        //     const productId = returnProduct[i].productId;
        //     const quantity = returnProduct[i].quantity;
        //     const price = returnProduct[i].price;
        //     const sku = returnProduct[i].sku;

        //     const Product = await productModel.findOne(
        //         {
        //             _id: productId
        //         },
        //         {
        //             variant: {
        //                 $elemMatch: { sku: sku },
        //                 name: 1,
        //                 discount: 1,
        //             },
        //         }
        //     );

        //     if (!Product || !Product.variant || Product.variant.length === 0) {
        //         continue;
        //     }
        //     console.log("index", i)
        //     console.log("Product.variant[i]", Product?.variant?.[i]);
        //     const variant = Product?.variant?.[i];
        //     console.log("variant", variant);

        //     let variantSize = variant?.size !== undefined ? variant?.size : "";
        //     let variantColour = variant?.colorName !== undefined ? variant?.colorName : "";

        //     const productInfo = {
        //         productId: productId,
        //         quantity: quantity,
        //         price: price,
        //         sku: sku,
        //         size: variantSize,
        //         colour: variantColour,
        //     };
        //     console.log("productInfo", productInfo);

        //     productArr.push(productInfo);
        // }
        //console.log(2);
        const returnDate = new Date(new Date().toLocaleDateString());

        const request = new returnOrderModel({
            orderId,
            isOrderReturn,
            shipmentType,
            returnProduct: returnProduct,
            returnDate,
            exchangeReason,
            images: uploadedImages,
        });
        const result = await request.save();

        if (result) {
            // console.log("orderId", orderId, "PRoductID", returnProduct.productId, returnProduct)
            if (result.isOrderReturn === true) {
                const time = new Date(new Date().toLocaleDateString());
                //log order status
                const data = new orderLogModel({
                    orderStatus: "Return",
                    orderId: mongoose.Types.ObjectId(orderId),
                    time,
                    message: exchangeReason,
                });
                await data.save();
                await orderModel.findOneAndUpdate(
                    { _id: orderId },
                    { status: "Return", webStatus: "Return" },
                    { new: true }
                );
            } else {
                const time = new Date(new Date().toLocaleDateString());
                //log order status
                const data = new orderLogModel({
                    orderStatus: "Return",
                    orderId: mongoose.Types.ObjectId(orderId),
                    time,
                    message: exchangeReason,
                });
                await data.save();
                await orderModel.findOneAndUpdate(
                    {
                        _id: orderId,
                        "product.productId": returnProduct?.[0].productId,
                    },
                    {
                        $set: {
                            status: "Return",
                            webStatus: "Delivered",
                            "product.$.returnStatus": true,
                        },
                    },
                    { new: true }
                );

            }

        }
        return result;
    },
    returnOrderList: async () => {

        const list = await returnOrderModel.find({}, { returnDate: 1, createdAt: 1 }).populate({
            path: "orderId",
            select: { _id: 1, status: 1, orderId: 1, },
            populate: {
                path: "customer",
                model: "Customer",
                select: { _id: 1, firstName: 1, lastName: 1, province: 1, state: 1, zipCode: 1, address: 1 },
            },
        }).sort({ createdAt: -1 });
        return list;
    },
    returnOrderDetails: async (orderId) => {
        //return order details with reason
        const order = await returnOrderModel
            .findOne(
                { orderId: orderId },
                {
                    exchangeReason: 1,
                    images: 1,
                    shipmentType: 1,
                    isOrderReturn: 1,
                    returnProduct: 1,
                }
            )
            .populate({
                path: "returnProduct.productId",

                select: { _id: 1, name: 1 },
            })
            .populate({
                path: "orderId",
                select: {
                    shippingAddress: 1,
                    contact: 1,
                    orderId: 1,
                    totalBill: 1,
                    "product.quantity": 1,
                    "product.price": 1,
                },
                populate: [
                    {
                        path: "customer",
                        model: "Customer",
                        select: { _id: 1, firstName: 1, lastName: 1, province: 1, state: 1, zipCode: 1, address: 1, region: 1 },
                        populate: {
                            path: "reigon",
                            model: "TaxType",
                            select: "taxType"
                        }
                    },
                    {
                        path: "product.productId",
                        model: "Product",
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
                    },
                ],
            });
        return order;
    },
    dispatchReturnOrder: async (status, orderId, message) => {
        var time = new Date(new Date().toLocaleDateString());
        // let { _id: statusId } = await orderStatusServices.orderStatus("Delivered");
        var order = await orderModel.findOne({ _id: orderId });
        console.log(order)
        if (!order) {
            throw new Error("Order Not Found");
        }
        let {
            status: oldOrderStatus,
            customer: customerId,
            totalBill,
            product,
            orderId: OrderId,
        } = order;
        var currentDate = new Date(new Date().toLocaleString());


        if (status === "Returned" && oldOrderStatus === "Return") {

            let returnOrder = await returnOrderModel.findOne(
                { orderId: orderId },
                { isOrderReturn: 1, returnProduct: 1 }
            );
            isOrderReturn = returnOrder.isOrderReturn;
            returnProduct = returnOrder.returnProduct;

            let orderPoint = await pointModel.findOne(
                { orderId: OrderId },
                { points: 1 }
            );
            if (orderPoint) {
                orderPoint = orderPoint?.points;
            }
            console.log("orderPoint", orderPoint);



            if (isOrderReturn === true) {
                try {
                    //update customer points
                    // const customerIds = order.map(product => product.productID);
                    let user = await customerModel.findOne(
                        { _id: order.customer },
                        { points: 1, email: 1 }
                    );

                    if (user.points - orderPoint <= 0) {
                        user.points = 0;
                    } else {
                        user.points -= orderPoint;
                    }

                    // Save the updated user object back to the database
                    await user.save();

                    // let user = await customerModel.findOneAndUpdate(
                    //     { _id: order.customer },
                    //     { $inc: { points: -orderPoint } }
                    // );
                    let points = user.points - orderPoint;
                    const orderpoint = await orderModel.findOneAndUpdate(
                        { _id: order._id },
                        { points: 0 }
                    );


                    //update customer membership in case of rturned order order
                    await pointServices.assaignPointMembership(order.customer, points);
                    const formattedTotalAmount = new Intl.NumberFormat('en-CA', {
                        style: 'currency',
                        currency: 'CAD'
                    }).format(order.totalBill)
                    let Name = "";
                    if (user) {
                        Name = `${user.firstName} ${user.lastName}`;
                    }
                    email = user.email;
                    let subject = `Order Return Request`;
                    let text = `Dear ${Name},
                    Your Order Return Request has been Approved!

                    Order Details:

                    -Order ID: # ${order.orderId}
                    -Approved Date: ${currentDate}
                    -Total Amount: CA$ ${formattedTotalAmount}

                    If you have any questions or concerns, feel free to reach out to our customer support team at Shopeez Customer Support.

                    ThankYou for choosing Shopeez!`;
                    //return order status log by admin
                    let returnStatus = await orderStatusServices.orderStatus("Returned");
                    console.log(returnStatus);
                    const returnOrderLog = new returnOrderStatusLogModel({
                        orderStatus: mongoose.Types.ObjectId(returnStatus._id),
                        orderId,
                        time,
                    });
                    await returnOrderLog.save();
                    //send mail to user
                    await sendNotificationEmail(subject, text, email);
                    //update product inventory
                    await productLogServices.productLog(product, "Returned", order.customer);
                    await productsServices.updateLogDealProduct(order.customer, product);
                    await returnOrderModel.deleteOne({ orderId: orderId });
                    console.log(orderId);

                    await orderModel.findOneAndUpdate(
                        { _id: orderId },
                        { status: "Returned", isDeliver: false, isAdminReturn: true },
                        { new: true }
                    );
                    return true;
                } catch (e) {
                    throw new Error(e.message);
                }
            } else {
                //if order partially returned
                try {
                    console.log("orderId", orderId, "returnProduct", returnProduct);
                    let returnOrderProduct = await orderServices.popReturnProduct(
                        orderId,
                        returnProduct
                    );
                    console.log(1);
                    totalPrice = returnOrderProduct;
                    console.log("totalPrice", totalPrice);


                    // let getPointPerOrder = await pointManageModel.find({
                    //     pointOrderPriceFrom: { $lte: totalPrice }
                    // });

                    // totalBill = totalBill - totalPrice;
                    // console.log("totalBill", totalBill);
                    // if (getPointPerOrder.length != 0) {
                    //     pointOrderPrice = getPointPerOrder[0].pointOrderPriceFrom;
                    //     pointPerOrder = getPointPerOrder[0].pointPerOrder;
                    //     var point = Math.ceil(totalBill / pointOrderPrice);
                    //     point = point * pointPerOrder;
                    //     await pointModel.findOneAndUpdate(
                    //         { orderId: OrderId },
                    //         { points: point }
                    //     );
                    // }
                    let getPointPerOrder = await pointManageModel.find({
                        pointOrderPriceTo: { $gte: totalPrice },
                        pointOrderPriceFrom: { $lte: totalPrice },
                    });

                    console.log('getPointPerOrder', getPointPerOrder);

                    const { pointOrderPriceFrom, pointPerOrder } = getPointPerOrder;

                    //totalBill = totalBill - totalPrice;
                    console.log("totalBill", totalBill);

                    let point = 0;

                    if (getPointPerOrder.length !== 0) {
                        // let pointOrderPrice = getPointPerOrder[0].pointOrderPriceFrom;
                        // let pointPerOrder = getPointPerOrder[0].pointPerOrder;

                        // Check if pointOrderPrice is not 0 to avoid division by zero
                        if (pointOrderPriceFrom !== 0) {
                            // point = Math.ceil(totalBill / pointOrderPrice) * pointPerOrder;
                            point = Math.ceil(totalBill / pointOrderPriceFrom) * pointPerOrder;
                        }
                    }
                    //console.log("point : ", point);

                    // const updateorderpoints = await pointModel.findOneAndUpdate(
                    //     { orderId: OrderId },
                    //     { points: point }
                    // );
                    // console.log("updatedorderpoints : ", updateorderpoints)

                    console.log("111")
                    const updatedtotalBill = await orderModel.findOneAndUpdate(
                        { _id: orderId },
                        { $inc: { totalBill: -totalPrice } },
                        { upsert: true, new: true }
                    );


                    console.log("@@#2222")

                    let user = await customerModel.findOne(
                        { _id: order.customer }, { firstName: 1, lastName: 1, email: 1 }
                        //  { $inc: { points: -orderPoint } }
                    );

                    let Name = "";
                    if (user) {
                        Name = `${user.firstName} ${user.lastName}`;
                    }
                    console.log("Minus user Points : ", user)
                    // let newPoint = await customerModel.findOneAndUpdate(
                    //     { _id: order.customer },
                    //     //  { $inc: { points: +point } }
                    // );
                    //console.log("Added user Points : ", newPoint);
                    console.log("UpdatedTotalBill", updatedtotalBill.totalBill)
                    //let points = newPoint.points + point;
                    const formattedTotalAmount = new Intl.NumberFormat('en-CA', {
                        style: 'currency',
                        currency: 'CAD'
                    }).format(updatedtotalBill.totalBill)
                    //update customer membership in case of rturned order order
                    //await pointServices.assaignPointMembership(order.customer, points);

                    email = user.email;
                    let subject = `Product Return Request`;
                    let text = `Dear ${Name},
                    Your Product Return Request has been Approved!

                    Order Details:

                    -Order ID: # ${updatedtotalBill.orderId}
                    -Approved Date: ${currentDate}

                    If you have any questions or concerns, feel free to reach out to our customer support team at Shopeez Customer Support.

                    ThankYou for choosing Shopeez!`;
                    await sendNotificationEmail(subject, text, email);
                    //return order log status by admin
                    const returnOrderLog = new returnOrderStatusLogModel({
                        orderStatus: status,
                        orderId: OrderId,
                        time,
                    });
                    await returnOrderLog.save();
                    //log of changing status of order after return some product
                    const data = new orderLogModel({
                        orderStatus: "Delivered",
                        orderId: orderId,
                        time,
                        message,
                    });
                    await data.save();
                    // await productsServices.updateLogDealProduct(
                    //     returnProduct,
                    //     order.customer
                    // );
                    await returnOrderModel.deleteOne({ orderId: orderId });
                    return true;
                } catch (e) {
                    throw new Error(e.message);
                }
            }
        } else {
            //if admint don't approved returned order
            if (oldOrderStatus === "Return") {
                try {
                    //return order status log by admin
                    // let cancelStatus = await orderStatusServices.orderStatus("Canceled");
                    // cancelStatus = cancelStatus._id;
                    const returnOrderLog = new returnOrderStatusLogModel({
                        orderStatus: "Cancel",
                        orderId,
                        time,
                    });
                    await returnOrderLog.save();
                    const data = new orderLogModel({
                        orderStatus: "Delivered",
                        orderId: orderId,
                        time,
                        message,
                    });
                    await data.save();
                    const updated = await orderModel.findOneAndUpdate(
                        { _id: orderId },
                        { status: "Delivered" },
                        { new: true }
                    );
                    let user = await customerModel.findById(
                        { _id: customerId },
                        { email: 1, firstName: 1, lastName: 1 }
                    );
                    let Name = "";
                    if (user) {
                        Name = `${user.firstName} ${user.lastName}`;
                    }
                    email = user.email;
                    let subject = "Return Request Rejected";
                    text = `Dear ${Name},
    Your Product Return Request for Order ID #${updated.orderId} has been rejected.

    -Rejection Reason:
    ${message}

    If you have any questions or concerns, feel free to reach out to our customer support team at Shopeez Customer Support.

    Thank you for choosing Shopeez!`;
                    // let text = `your order ${orderId} return product approved successfully`;
                    await sendNotificationEmail(subject, text, email);
                    await returnOrderModel.deleteOne({ orderId: orderId });
                    return true;
                } catch (e) {
                    console.log(e.message);
                    //throw new Error(e.message);
                }
            } else {
                //if order don't returned by user
                return false;
                // throw new Error("This Order not Returned");
            }
        }
    },
};

module.exports = returnOrderServices;
