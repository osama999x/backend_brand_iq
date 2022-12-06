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
const mPromotionModel = require("../model/mPromotionModel");
const pointManageModel = require("../model/pointManageModel");
const promotionBuyerLogModel = require("../model/promotionBuyerLogModel");
const customerModel = require("../model/customerModel");
const membershipModel = require("../model/membershipModel");
const customerMembershipModel = require("../model/customerMembershipModel");
const orderServices = {
  orderTracking: async (orderId) => {
    let orderTrack = await orderLogModel
      .find(
        {
          orderId: { $in: orderId },
        },
        { _id: 0, time: 1, orderId: 1 }
      )
      .populate({
        path: "orderStatus",
        select: { orderStatusName: 1 },
      })
      .lean();
    if (orderTrack.length != 0) {
      orderTrack = orderTrack.map((item) => {
        item.orderStatus = item.orderStatus.orderStatusName;
        var time = item.time;
        item.time = new Date(time).toLocaleString();
        return item;
      });
    }

    return orderTrack;
  },
  orderDispatch: async (deliveryPartner, orderStatus, orderId) => {
    var order = await orderModel.find({ orderId: { $in: orderId } });
    if (order.length != 0) {
      const data = new orderLogModel({
        deliveryPartner: mongoose.Types.ObjectId(deliveryPartner),
        orderStatus: mongoose.Types.ObjectId(orderStatus),
        orderId,
      });
      const result = await data.save();
      if (result) {
        let findStatus = await orderStatusModel.findOne(
          { _id: orderStatus },
          { orderStatusName: 1, _id: 0 }
        );
        let status = findStatus.orderStatusName;
        await orderModel.findOneAndUpdate(
          { orderId },
          {
            status: status,
          },
          { new: true }
        );
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
    let result = await orderModel
      .find(
        {
          customer: { $in: customerId },
          isDeletedByUser: 0,
          isDeletedByAdmin: 0,
        },
        { orderId: 1, placedOn: 1, status: 1 }
      )
      .populate({
        path: "product.productId",
        select: { thumbnail: 1 },
      })
      .lean();
    if (result.length != 0) {
      result = result.map((item) => {
        item.thumbnail = item.product[0].productId.thumbnail;
        delete item.product;
        return item;
      });
    }

    return result;
  },
  getorder: async () => {
    const result = orderModel.find({}, projection.orderprojection).populate({
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
          "product.quantity": 1,
          "product.price": 1,
        }
      )
      .populate({
        path: "product.productId",
        select: { _id: 1, name: 1, thumbnail: 1 },
      })
      .populate({
        path: "product.categoryId",
        select: { _id: 1, name: 1 },
      })
      .lean();
    if (result) {
      result.productThumbnail = result.product[0].productId.thumbnail;
      var list = result.product.map((item) => {
        item.productName = item.productId.name;
        item.productId = item.productId._id;
        item.productCategory = item.categoryId.name;
        item.productQuantity = item.quantity;
        item.productPrice = item.price;
        delete item.productId;
        delete item.categoryId;
        return item;
      });
      result.product = list;
    }
    return result;
  },
  getOne: async (_id) => {
    const list = await orderModel
      .findById(
        { _id },
        {
          address: 1,
          contact: 1,
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
      })
      .populate({
        path: "product.categoryId",
        select: { _id: 1, name: 1 },
      })
      .populate({
        path: "product.subcategoryId",
        select: { _id: 1, name: 1 },
      });
    return list;
  },

  add: async (
    customer,
    product,
    paymentMode,
    totalBill,
    address,
    contact,
    orderId,
    trackingId,
    channel
  ) => {
    // try {
    var productArr = [];
    //Get Categories SubCategories against Product
    var productLength = product.length;
    for (let i = 0; i < productLength; i++) {
      productId = product[i].productId;
      quantity = product[i].quantity;
      price = product[i].price;
      sku = product[i].sku;
      size = product[i].size;
      if (price <= 0) {
        return;
      }
      const list = await productModel
        .find(
          { _id: productId },
          {
            _id: 1,
          }
        )
        .populate({
          path: "category",
          select: { _id: 1 },
        })
        .populate({
          path: "subcategory",
          select: { _id: 1 },
        });
      var categoryId = list[0].category._id;
      var subcategoryId = list[0].subcategory._id;
      //check a customer buy promotion product already
      let productDetail = await productModel.findOne(
        { _id: productId },
        { variant: { $elemMatch: { sku: sku } }, name: 1 }
      );
      var productName = productDetail.name;
      var Id = productDetail._id;
      actualPrice = productDetail.variant[0].actualPrice;
      discountedPrice = productDetail.variant[0].discountedPrice;
      if (price === actualPrice || price === discountedPrice) {
        //ARRAY OF PRODUCTS OBJECTS
        productArr.push({
          productId: mongoose.Types.ObjectId(productId),
          categoryId: mongoose.Types.ObjectId(categoryId),
          subcategoryId: mongoose.Types.ObjectId(subcategoryId),
          quantity: quantity,
          price: price,
          sku: sku,
          size: size,
        });
      } else {
        let currentDate = new Date().toLocaleDateString();
        currentDate = new Date(currentDate);
        let isPromotionProduct = await mPromotionModel.findOne(
          {
            $and: [
              { "promotion.product": { $in: productId } },
              { "promotion.launchDate": { $lte: currentDate } },
              { "promotion.endingDate": { $gte: currentDate } },
            ],
          },
          { promotion: 1, _id: 1 }
        );
        if (isPromotionProduct) {
          const currentDate = new Date().toLocaleDateString();
          currentDate = new Date(currentDate);
          let isBuy = await promotionBuyerLogModel.findOne({
            $and: [
              { customer: { $in: customer } },
              { product: { $in: productId } },
              { launchDate: { $lte: currentDate } },
              { endingDate: { $gte: currentDate } },
            ],
          });
          if (isBuy) {
            let productDetail = await productModel.findOne(
              { _id: productId },
              { variant: { $elemMatch: { sku: sku } }, name: 1 }
            );
            var productName = productDetail.name;
            var Id = productDetail._id;
            var actualPrice = productDetail.variant[0].actualPrice;
            var discountedPrice = productDetail.variant[0].discountedPrice;

            // if (price === actualPrice || price === discountedPrice) {
            //   continue;
            // } else {
            const result = {
              message: {
                msg: "You are already bought a promotional product.Now you can buy with actualPrice",
                Id: Id,
                productName: productName,
                actualPrice: actualPrice,
                discountedPrice: discountedPrice,
              },
            };
            throw result;
          } else {
            productArr.push({
              productId: mongoose.Types.ObjectId(productId),
              categoryId: mongoose.Types.ObjectId(categoryId),
              subcategoryId: mongoose.Types.ObjectId(subcategoryId),
              quantity: quantity,
              price: price,
              sku: sku,
              size: size,
            });
          }
        } else {
          let productDetail = await productModel.findOne(
            { _id: productId },
            { variant: { $elemMatch: { sku: sku } }, name: 1 }
          );
          var productName = productDetail.name;
          var Id = productDetail._id;
          var actualPrice = productDetail.variant[0].actualPrice;
          var discountedPrice = productDetail.variant[0].discountedPrice;
          const result = {
            message: {
              msg: "This promotion discount is expire .Now you can buy with actualPrice",
              Id: Id,
              productName: productName,
              actualPrice: actualPrice,
              discountedPrice: discountedPrice,
            },
          };
          throw result;
        }
      }
    }
    var order = new orderModel({
      customer: mongoose.Types.ObjectId(customer),
      product: productArr,
      address,
      contact,
      totalBill,
      paymentMode,
      orderId,
      trackingId,
      channel,
    });
    //ORDER PLACED
    var result = await order.save();
    var orderBill = result.totalBill;
    var customerId = result.customer;
    orderId = result.orderId;
    var Result = { trackingId: result.trackingId, orderId: result.orderId };
    if (result) {
      //awarder with points to Order Holder
      let getPointPerOrder = await pointManageModel.find({});
      if (getPointPerOrder) {
        pointOrderPrice = getPointPerOrder[0].pointOrderPrice;
        pointPerOrder = getPointPerOrder[0].pointPerOrder;
        let point = Math.ceil(orderBill / pointOrderPrice);
        point = point * pointPerOrder;
        const data = new pointModel({
          customer: mongoose.Types.ObjectId(customerId),
          points: point,
          orderId: orderId,
        });
        await data.save();
        await customerModel.findOneAndUpdate(
          { _id: customerId },
          { $inc: { points: +point } }
        );
      }
      //if order product is promotionlist then save into promorionBuyerLagModel
      var productLength = product.length;
      for (let i = 0; i < productLength; i++) {
        var productId = product[i].productId;
        let currentDate = new Date().toLocaleDateString();
        let isPromotionProduct = await mPromotionModel.findOne(
          {
            $and: [
              { "promotion.product": { $in: productId } },
              { "promotion.launchDate": { $lte: currentDate } },
              { "promotion.endingDate": { $gte: currentDate } },
            ],
          },
          { promotion: 1, _id: 1, lounchDate: 1, endingDate: 1 }
        );
        if (isPromotionProduct) {
          var promotionId = isPromotionProduct._id;
          var promtionProductLength =
            isPromotionProduct.promotion[i].product.length;
          for (var k = 0; k < promtionProductLength; k++) {
            if (
              isPromotionProduct.promotion[i].product[k].toLocaleString() ===
              productId
            ) {
              var buyerPromotionProductId =
                isPromotionProduct.promotion[i].product[k];
              launchDate = isPromotionProduct.promotion[i].launchDate;
              endingDate = isPromotionProduct.promotion[i].endingDate;
              // isPromotionProductArr.push(productId);
              const data = new promotionBuyerLogModel({
                customer: customerId,
                product: buyerPromotionProductId,
                promotion: promotionId,
                launchDate: launchDate,
                endingDate: endingDate,
              });
              await data.save();
            }
          }
        }
      }
      //assaign memnership acording to points
      let customerPoints = await customerModel.findById(
        { _id: customerId },
        { points: 1 }
      );
      if (customerPoints) {
        customerPoints = customerPoints.points;
        //var customerId = result._id;
        const membershipCategories = ["Silver", "Gold", "Platinum", "Diamond"];
        for (var category of membershipCategories) {
          //category=category.membershipCategories;
          var currentCategory = await membershipModel.findOne(
            { membershipCategory: { $in: category } },
            { thresholdFrom: 1, thresholdTo: 1, membershipCategory: 1 }
          );
          thresholdFrom = currentCategory.thresholdFrom;
          thresholdTo = currentCategory.thresholdTo;
          category = currentCategory.membershipCategory;
          _id = currentCategory._id;
          if (
            customerPoints >= thresholdFrom &&
            customerPoints <= thresholdTo
          ) {
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
            break;
          }
        }
      }
    }
    //Order Placed Then Clear Add to cart History
    if (result && channel === "Web View") {
      await addToCartModel.deleteOne({ customer: { $in: customer } });
    }
    //UPDATE PRODUCT QUANTITY
    if (result) {
      var productLength = product.length;
      for (let i = 0; i < productLength; i++) {
        productId = product[i].productId;
        quantity = product[i].quantity;
        price = product[i].price;
        sku = product[i].sku;
        const filter = { _id: productId, "variant.sku": sku };
        const update = { $inc: { "variant.$.quantity": -quantity } };
        // let checkQuantity = await productModel.findOne(filter, {
        //   "variant.quantity": 1,
        // });
        await productModel.findOneAndUpdate(filter, update);
        productLog = new productLogModel({
          product: mongoose.Types.ObjectId(productId),
          description: `SOLD,PRODUCTID:${productId},SKU:${sku},QUANTITY:${quantity},PRICE:${price},CUSTOMER:${customer},Size:${size}`,
        });
        await productLog.save();
      }
    }

    return Result;
    // } catch (error) {
    //   throw new Error("error");
    // }
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
    let order = await orderModel.find({});
    let result = await orderModel.aggregate([
      { $match: { status: "Delivered" } },
      {
        $group: {
          _id: {
            year: { $year: "$placedOn" },
            placedOn: { $month: "$placedOn" },
            status: "$status",
          },
          numberOfOrder: { $sum: 1 },
        },
      },
    ]);
    const totalOrder = order.length;
    if (result.length != 0) {
      result = result.map((item) => {
        item.year = item._id.year;
        item.month = item._id.placedOn;
        item.status = item._id.status;
        item.totalDelivered = item.numberOfOrder;
        delete item._id;
        delete item.numberOfOrder;
        return item;
      });
    }
    if (result.length === 0) {
      result = [
        {
          years: new Date().getFullYear(),
          month: new Date().getMonth(),
          status: "Delivered",
          totalDelivered: 0,
        },
      ];
    }
    const total = {
      totalOrder: totalOrder,
    };
    result.push(total);
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
};

module.exports = orderServices;
