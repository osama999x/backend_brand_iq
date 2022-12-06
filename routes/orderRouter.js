const express = require("express");
const expressAsyncHandler = require("express-async-handler");
const customerModel = require("../model/customerModel");
const orderServices = require("../services/orderServices");
const systemNotificationServices = require("../services/systemNotificationServices");
const notificationInfo = require("../utils/notificationInfo");
const orderRouter = express.Router();
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
    const { deliveryPartnerId, orderStatus, orderId } = req.body;
    const result = await orderServices.orderDispatch(
      deliveryPartnerId,
      orderStatus,
      orderId
    );
    if (result === false) {
      return res.status(400).send({
        msg: "Order Doesn't Exist",
      });
    }
    if (result) {
      return res.status(200).send({
        msg: "Orders Successfully Dispatch",
      });
    } else {
      return res.status(400).send({ msg: "Order Not Dispatch" });
    }
  })
);
orderRouter.get(
  "/all",
  expressAsyncHandler(async (req, res) => {
    const result = await orderServices.getorder();
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
  "/",
  expressAsyncHandler(async (req, res) => {
    const {
      customer,
      product,
      paymentMode,
      totalBill,
      address,
      contact,
      channel,
    } = req.body;
    if (!customer || !product || !paymentMode || !totalBill) {
      return res.status(400).send({ msg: "Fields Missing" });
    }
    try {
      var orderId = Math.floor(Math.random() * 100000 + 100000)
        .toString()
        .substring(1);
      var trackingId = Math.floor(Math.random() * 100000 + 100000)
        .toString()
        .substring(1);
      trackingId = `MSAFA-${trackingId}`;
      const result = await orderServices.add(
        customer,
        product,
        paymentMode,
        totalBill,
        address,
        contact,
        orderId,
        trackingId,
        channel
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
