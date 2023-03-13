const orderModel = require("../model/orderModel");
const pointModel = require("../model/pointModel");
const customerModel = require("../model/customerModel");
const membershipModel = require("../model/membershipModel");
const customerMembershipModel = require("../model/customerMembershipModel");
const readNotficationModel = require("../model/readNotificationModel");
const pointServices = {
  customerOrderPoints: async (customer, date) => {
    var pointDate = new Date(
      new Date().getTime() - date * 24 * 60 * 60 * 1000
    ).toLocaleDateString();
    let orderDetails = await orderModel
      .find(
        { customer: { $in: customer }, createdAt: { $gte: pointDate } },
        {
          placedOn: 1,
          orderId: 1,
          channel: 1,
        }
      )
      .populate({
        path: "product.productId",
        select: { thumbnail: 1, name: 1 },
      })
      .lean();
    if (orderDetails.length != 0) {
      orderDetails = orderDetails.map((item) => {
        item.productThumbnail = item.product[0].productId.thumbnail;
        item.name = item.product[0].productId.name;
        delete item.product;
        return item;
      });
      let orderPoint = await pointModel.find(
        { customer: { $in: customer }, createdAt: { $gte: pointDate } },
        { points: 1 }
      );
      if (orderPoint.length != 0) {
        for (var i = 0; i < orderPoint.length; i++) {
          var point = orderPoint[i].points;
          orderDetails[i].orderPoint = point;
        }
      } else {
        for (var i = 0; i < orderDetails.length; i++) {
          orderDetails[i].orderPoint = 0;
        }
      }
    }
    var totalPoints = await customerModel.findById(
      { _id: customer },
      { points: 1, _id: 0 }
    );

    if (totalPoints) {
      totalPoints = totalPoints.points;
    }
    return { totalPoints, orderDetails };
  },
  orderPoints: async (orderId) => {
    let orderDetails = await orderModel
      .findOne(
        { orderId: { $in: orderId } },
        {
          placedOn: 1,
          orderId: 1,
        }
      )
      .populate({
        path: "product.productId",
        select: { thumbnail: 1, name: 1 },
      })
      .lean();
    orderDetails.productThumbnail = orderDetails.product[0].productId.thumbnail;
    orderDetails.name = orderDetails.product[0].productId.name;
    delete orderDetails.product;
    let orderPoints = await pointModel.findOne(
      {
        orderId: { $in: orderId },
      },
      { points: 1, _id: 0 }
    );
    orderDetails.orderPoint = orderPoints.points;
    delete orderPoints;
    return orderDetails;
  },
  customerTotalPoints: async (customer) => {
    // let customerOrder = await orderModel
    //   .find(
    //     { customer: { $in: customer } },
    //     {
    //       placedOn: 1,
    //       orderId: 1,
    //     }
    //   )
    //   .populate({
    //     path: "product.productId",
    //     select: { thumbnail: 1, title: 1 },
    //   })
    //   .lean();
    // customerOrder = customerOrder.map((item) => {
    //   item.productThumbnail = item.product[0].productId.thumbnail;
    //   item.title = item.product[0].productId.title;
    //   delete item.product;
    //   return item;
    // });
    // let orderPoints = await pointModel
    //   .find(
    //     {
    //       customer: { $in: customer },
    //     },
    //     { points: 1, _id: 0 }
    //   )
    //   .lean();
    // for (var i = 0; i < orderPoints.length; i++) {
    //   var OPoints = orderPoints[i].points;
    //   customerOrder[i]["points"] = OPoints;
    // }
    let customerPoints = await customerModel.findById(
      {
        _id: customer,
      },
      { points: 1 }
    );
    // if (customerPoints) {
    //   var totalPoints = 0;
    //   // var customerId = customerPoints[0].customer;
    //   customerPoints.forEach((element) => {
    //     totalPoints += element.points;
    //   });
    // }
    // const result = {
    //   customerId: customer,
    //   totalPoints: totalPoints,
    // };
    return customerPoints;
  },
  assaignPointMembership: async (customerId, customerPoints) => {
    const membershipCategories = ["Silver", "Gold", "Platinum", "Diamond"];
    var currentCategory = await membershipModel.findOne(
      {
        membershipCategory: { $in: membershipCategories },
        thresholdFrom: { $lte: customerPoints },
        thresholdTo: { $gte: customerPoints },
      },
      { membershipCategory: 1 }
    );
    if (currentCategory) {
      category = currentCategory.membershipCategory;
      _id = currentCategory._id;
      await customerModel.findOneAndUpdate(
        { _id: { $in: customerId } },
        { membershipCategory: category }
      );
      const data = new customerMembershipModel({
        customer: customerId,
        membershipId: _id,
        membershipCategory: category,
        customerPoints: customerPoints,
      });
      await data.save();
    }
    const unRead = new readNotficationModel({
      customer: customerId,
      readNotfication: [],
    });
    await unRead.save();
  },
  updateCustomerRedeemPoints: async (customerId, redeemValue) => {
    const result = await customerModel.findOneAndUpdate(
      { _id: customerId },
      { $inc: { points: -redeemValue } }
    );
    return result;
  },
};
module.exports = pointServices;
