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
const orderServices = {
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
  orderDispatch: async (deliveryPartner, orderStatus, orderId) => {
    var order = await orderModel.findOne({ orderId: { $in: orderId } });
    console.log(order);
    if (order) {
      var oldOrderStatus = order.status;
      totalBill = order.totalBill;
      var customerId = order.customer;
      product = order.product;
      redeemValue = order.redeemValue;
      couponCode = order.couponCode;
      const time = new Date(new Date().toLocaleDateString());
      const data = new orderLogModel({
        deliveryPartner: mongoose.Types.ObjectId(deliveryPartner),
        orderStatus: mongoose.Types.ObjectId(orderStatus),
        orderId,
        time,
      });
      const result = await data.save();
      if (result) {
        let findStatus = await orderStatusModel.findOne(
          { _id: orderStatus },
          { orderStatusName: 1, _id: 0 }
        );
        var status = findStatus.orderStatusName;
        const updateStatus = await orderModel.findOneAndUpdate(
          { orderId },
          {
            status: status,
          },
          { new: true }
        );
        if (
          updateStatus &&
          oldOrderStatus != status &&
          status === "Delivered"
        ) {
          let getPointPerOrder = await pointManageModel.find({});
          if (getPointPerOrder.length != 0) {
            pointOrderPrice = getPointPerOrder[0].pointOrderPrice;
            pointPerOrder = getPointPerOrder[0].pointPerOrder;
            var point = Math.ceil(totalBill / pointOrderPrice);
            point = point * pointPerOrder;
            const data = new pointModel({
              customer: mongoose.Types.ObjectId(customerId),
              points: point,
              orderId: orderId,
            });
            await data.save();
            var updatedPoints = await customerModel.findOneAndUpdate(
              { _id: customerId },
              { $inc: { points: +point } }
            );
            if (updatedPoints) {
              point = updatedPoints.points + point;
              await pointServices.assaignPointMembership(customerId, point);
            }
          }
        }
        //update inventory status if order reject or cancel
        else if (
          (updateStatus &&
            status === "Rejected" &&
            oldOrderStatus != status &&
            oldOrderStatus != "Cancelled") ||
          (updateStatus &&
            status === "Cancelled" &&
            oldOrderStatus != status &&
            oldOrderStatus != "Rejected")
        ) {
          const user = await customerModel.findById(
            { _id: customerId },
            { email: 1 }
          );
          email = user.email;
          //send mail to user
          let subject = sendEmailNotificationInfo.orderResponse.title;
          let text = `your order ${orderId} has been ${status} due to some problem. Please try later!`;
          await sendNotificationEmail(subject, text, email);
          //update product inventory
          await productLogServices.productLog(product, status, customerId);
          await productsServices.updateLogDealProduct(product, customerId);
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
        }
        return result;
      } else {
        return;
      }
    } else {
      let result = false;
      // "Order Doesn't Exist";
      return result;
    }
  },
  customerOrderHistory: async (customerId) => {
    let result = await orderModel.aggregate([
      {
        $match: {
          customer: new mongoose.Types.ObjectId(customerId),
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
          status: 1,
          firstProduct: 1,
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
          thumbnail: "$product_info.thumbnail",
        },
      },
    ]);
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
      });
    return result;
  },
  getOrderHistoryDetail: async (_id) => {
    let result = await orderModel
      .findById(
        { _id },
        {
          placedOn: 1,
          status: 1,
          orderId: 1,
          trackingId: 1,
          paymentMode: 1,
          "product.quantity": 1,
          "product.price": 1,
          "product.sku": 1,
        }
      )
      .populate({
        path: "product.productId",
        select: { _id: 1, name: 1, thumbnail: 1 },
        populate: {
          path: "category",
          model: "Category",
        },
      })
      .lean();
    if (result) {
      result.productThumbnail = result.product[0].productId.thumbnail;
      var list = result.product.map((item) => {
        item.productCategory = item.productId.category.name;
        item.productName = item.productId.name;
        item.productId = item.productId._id;
        item.productQuantity = item.quantity;
        item.productPrice = item.price;
        // delete item.productId;
        delete item.categoryId;
        return item;
      });
      result.product = list;
    }
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
          status: 1,
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

    return order;
  },
  checkDealProduct: async (customer, product) => {
    const currentDate = new Date(new Date().toLocaleDateString());
    //check product all possible validity
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
          isDiscount: 1,
        }
      );
      console.log(Product);
      //check prodcut availbility
      if (!Product || !Product.variant.length)
        throw { message: { msg: `Product doesn't exist` } };
      //check product quantity meet the requirements
      if (quantity > Product.variant[0].quantity)
        throw { message: { msg: `${Product.name} not enough quantity!` } };
      if (Product.isDeal) {
        //check deal product all possible valdities
        if (Product.dealExpire >= currentDate) {
          if (price !== Product.variant[0].actualPrice - Product.discount)
            throw {
              message: {
                msg: `${Product.name} price has been changed, update the cart!`,
              },
            };
          const buy = await dealBuyerLogModel.findOne({
            customer,
            product: productId,
          });
          if (buy)
            throw {
              message: {
                msg: `You already bought this deal product, remove ${Product.name} from the cart!`,
              },
            };
        } else {
          throw {
            message: {
              msg: `Deal expired, remove ${Product.name} from the cart!`,
            },
          };
        }
      } else if (Product.isDiscount) {
        //check discounted product
        if (price !== Product.variant[0].discountedPrice)
          throw {
            message: {
              msg: `${Product.name} price has been changed, update the cart!`,
            },
          };
      } else {
        const checkPromotion = await promotionModel.findOne({
          product: { $in: productId },
          expireDate: { $gte: currentDate },
        });
        if (checkPromotion) {
          //check promotion
          if (
            price !==
            Product.variant[0].actualPrice -
              (Product.variant[0].actualPrice * checkPromotion.discount) / 100
          )
            throw {
              message: {
                msg: `Promotion expired, update the cart or remove ${Product.name} from it!`,
              },
            };
        } else if (price !== Product.variant[0].actualPrice) {
          //check actual price
          throw {
            message: {
              msg: `${Product.name} price has been changed, update the cart!`,
            },
          };
        }
      }
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
    address,
    contact,
    orderId,
    trackingId,
    channel,
    couponCode
  ) => {
    try {
      var currentDate = new Date(new Date().toLocaleDateString());
      var order = new orderModel({
        customer: mongoose.Types.ObjectId(customer),
        product,
        paymentMode,
        totalBill,
        totalAmount,
        redeemValue,
        address,
        contact,
        orderId,
        trackingId,
        placedOn: currentDate,
        channel,
        couponCode,
      });
      //ORDER PLACED
      var result = await order.save();
      var customerId = result.customer;
      orderId = result.orderId;
      console.log("result", result);
      var Result = {
        _id: result._id,
        trackingId: result.trackingId,
        orderId: result.orderId,
      };
      console.log("Result", Result);
      if (result) {
        let subject = sendEmailNotificationInfo.orderResponse.title;
        let text =
          sendEmailNotificationInfo.orderResponse.body +
          `. Your order id is ${Result.orderId}`;
        let userEmail = await customerModel.findOne(
          { _id: customerId },
          { email: 1, _id: 0 }
        );
        if (userEmail) {
          await sendNotificationEmail(subject, text, userEmail.email);
        }
        //consume Customer Coupon
        if (result.couponCode !== "00") {
          coupanPolicyServices.consumeCoupon(customerId, result.couponCode);
        }
        //UPDATE PRODUCT QUANTITY
        await productLogServices.productLog(product, "SOLD", customerId);
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
      throw e;
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
  orderReport: async () => {
    let result = await orderModel.aggregate([
      {
        $match: { status: "Delivered" },
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
    ]);

    if (result.length === 0) {
      result = [
        {
          year: new Date().getFullYear(),
          month: new Date().getMonth(),
          status: "Delivered",
          totalDelivered: 0,
        },
      ];
    } else {
      result = result.map(({ _id, order }) => ({
        year: _id.year,
        month: _id.month,
        status: _id.status,
        totalDelivered: order,
      }));
    }

    result.push({
      totalOrder: await orderModel.countDocuments(),
    });

    return result;
  },
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
      .sort({ _id: 1 });
    if (result.length != 0) {
      var totalOrder = 0;
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
    const total = {
      totalOrder: totalOrder,
    };
    result.push(total);
    return result;
  },
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
        description: `return product,PRODUCTID:${productId},SKU:${sku},QUANTITY:${quantity},PRICE:${price},CUSTOMER:${customerId},Size:${size}`,
      });
      await productLog.save();
    }
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
};

module.exports = orderServices;
