const returnOrderModel = require("../model/returnOrderModel");
const mongoose = require("mongoose");
const projection = require("../config/mongoProjection");
const uploadFile = require("../utils/uploadFile");
const orderModel = require("../model/orderModel");
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
    if (images.length != 0) {
      for (var i = 0; i < images.length; i++) {
        var image = await uploadFile(images[i]);
        imgArr.push(image);
      }
    } else {
      imgArr = [];
    }
    const returnDate = new Date(new Date().toLocaleDateString());
    const request = new returnOrderModel({
      orderId,
      isOrderReturn,
      shipmentType,
      returnProduct,
      returnDate,
      exchangeReason,
      images: imgArr,
    });
    const result = await request.save();
    if (result) {
      const time = new Date(new Date().toLocaleDateString());
      //log order status
      const data = new orderLogModel({
        orderStatus: "Returned",
        orderId: mongoose.Types.ObjectId(orderId),
        time,
        message: exchangeReason,
      });
      await data.save();
      await orderModel.findOneAndUpdate(
        { _id: orderId },
        { status: "Returned" },
        { new: true }
      );
    }
    return result;
  },
  returnOrderList: async () => {
    //return order list
    const list = await returnOrderModel.find({}, { returnDate: 1 }).populate({
      path: "orderId",
      select: { _id: 1, status: 1, orderId: 1 },
      populate: {
        path: "customer",
        model: "Customer",
        select: { _id: 1, firstName: 1, lastName: 1 },
      },
    });
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
        }
      )
      .populate({
        path: "returnProduct.productId",

        select: { _id: 1, name: 1 },
      })
      .populate({
        path: "orderId",
        select: {
          address: 1,
          contact: 1,
          orderId: 1,
          "product.quantity": 1,
          "product.price": 1,
        },
        populate: [
          {
            path: "customer",
            model: "Customer",
            select: { _id: 1, firstName: 1, lastName: 1 },
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
    var order = await orderModel.findOne({ _id: { $in: orderId } });
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
    if (status === "Returned" && oldOrderStatus === "Returned") {
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
        orderPoint = orderPoint.points;
      }
      //if return order reject or canceled then update inventory status
      if (isOrderReturn === true) {
        try {
          //update customer points
          let user = await customerModel.findOneAndUpdate(
            { _id: customerId },
            { $inc: { points: -orderPoint } }
          );
          let points = user.points - orderPoint;
          //update customer membership in case of rturned order order
          await pointServices.assaignPointMembership(customerId, points);
          email = user.email;
          let subject = sendEmailNotificationInfo.orderResponse.title;
          let text = `your order ${OrderId} has been returned successfully`;
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
          await productLogServices.productLog(product, "Returned", customerId);
          await productsServices.updateLogDealProduct(product, customerId);
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
          let returnOrderProduct = await orderServices.popReturnProduct(
            orderId,
            returnProduct
          );
          totalPrice = returnOrderProduct.totalPrice;
          let getPointPerOrder = await pointManageModel.find({});
          totalBill = totalBill - totalPrice;
          console.log("totalBill", totalBill);
          if (getPointPerOrder.length != 0) {
            pointOrderPrice = getPointPerOrder[0].pointOrderPrice;
            pointPerOrder = getPointPerOrder[0].pointPerOrder;
            var point = Math.ceil(totalBill / pointOrderPrice);
            point = point * pointPerOrder;
            await pointModel.findOneAndUpdate(
              { orderId: OrderId },
              { points: point }
            );
          }
          let user = await customerModel.findOneAndUpdate(
            { _id: customerId },
            { $inc: { points: -orderPoint } }
          );
          let newPoint = await customerModel.findOneAndUpdate(
            { _id: customerId },
            { $inc: { points: +point } }
          );
          let points = newPoint.points + point;
          //update customer membership in case of rturned order order
          await pointServices.assaignPointMembership(customerId, points);
          email = user.email;
          let subject = sendEmailNotificationInfo.orderResponse.title;
          let text = `your order ${OrderId} return product approved successfully`;
          await sendNotificationEmail(subject, text, email);
          //return order log status by admin
          const returnOrderLog = new returnOrderStatusLogModel({
            orderStatus: mongoose.Types.ObjectId(statusId),
            orderId,
            time,
          });
          await returnOrderLog.save();
          //log of changing status of order after return some product
          const data = new orderLogModel({
            orderStatus: "Delivered",
            orderId: OrderId,
            time,
            message,
          });
          await data.save();
          await productsServices.updateLogDealProduct(
            returnProduct,
            customerId
          );
          await returnOrderModel.deleteOne({ orderId: orderId });
          return true;
        } catch (e) {
          throw new Error(e.message);
        }
      }
    } else {
      //if admint don't approved returned order
      if (oldOrderStatus === "Returned") {
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
            orderId: OrderId,
            time,
            message,
          });
          await data.save();
          await orderModel.findOneAndUpdate(
            { _id: orderId },
            { status: "Delivered" },
            { new: true }
          );
          let user = await customerModel.findById(
            { _id: customerId },
            { email: 1 }
          );
          email = user.email;
          let subject = sendEmailNotificationInfo.orderResponse.title;
          // let text = `your order ${orderId} return product approved successfully`;
          await sendNotificationEmail(subject, message, email);
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
