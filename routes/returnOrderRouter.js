const express = require("express");
const expressAsyncHandler = require("express-async-handler");
const exchangeOrderModel = require("../model/returnOrderModel");
const returnOrderServices = require("../services/returnOrderServices");
const orderModel = require("../model/orderModel");
const orderLogModel = require("../model/orderLogModel");
const mongoose = require("mongoose");
const { Stats } = require("fs");
const returnOrderRouter = express.Router();
const multer = require("multer");
const XLSX = require("xlsx");

// Multer configuration for file upload
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "public/images");
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    },
});
const upload = multer({ storage });
returnOrderRouter.post(
    "/",
    expressAsyncHandler(async (req, res) => {
        const {
            orderId,
            isOrderReturn,
            shipmentType,
            returnProduct,
            exchangeReason,
            images,
        } = req.body;
        //        console.log('req.body', req.body)
        if (!orderId || !exchangeReason || !shipmentType) {
            return res.status(400).send({ msg: "Fields Missing" });
        }

        const raw = String(orderId).trim();
        let order = null;
        if (mongoose.Types.ObjectId.isValid(raw)) {
            order = await orderModel.findById(raw, { _id: 1, orderId: 1, status: 1 }).lean();
        }
        if (!order) {
            order = await orderModel.findOne({ orderId: raw }, { _id: 1, orderId: 1, status: 1 }).lean();
        }
        if (!order) {
            return res.status(404).send({ msg: "Order Not Found" });
        }

        // Prevent duplicate requests: returnOrderModel has unique orderId.
        const existing = await exchangeOrderModel.findOne({ orderId: order._id }, { _id: 1 }).lean();
        if (existing) {
            return res.status(409).send({ msg: "You Have Already Made Request for Return" });
        }

        // Return/exchange allowed only after Delivered
        if (order.status !== "Delivered") {
            return res.status(400).send({ msg: "Order return request is Not Applicable" });
        }

        // Eligibility window: 30 days from Delivered event (fallback to order updatedAt if needed)
        const deliveredLog = await orderLogModel
            .findOne({ orderId: order._id, orderStatus: "Delivered" }, { time: 1 })
            .sort({ time: -1 })
            .lean();

        const deliveredAt = deliveredLog && deliveredLog.time ? new Date(deliveredLog.time) : null;
        if (!deliveredAt || isNaN(deliveredAt.getTime())) {
            // If we can't determine delivery timestamp, allow request but mark as applicable to Delivered state only.
            // (We already ensured order.status === "Delivered".)
        } else {
            const now = new Date();
            const deadline = new Date(deliveredAt);
            deadline.setDate(deadline.getDate() + 30);
            if (now > deadline) {
                return res.status(400).send({ msg: "Order return request applicable under 30 days" });
            }
        }

        if (!Array.isArray(returnProduct) || returnProduct.length === 0) {
            return res.status(400).send({ msg: "returnProduct is required" });
        }

        const result = await returnOrderServices.exchangeOrder(
            order._id,
            Boolean(isOrderReturn),
            shipmentType,
            returnProduct,
            exchangeReason,
            images
        );
        if (result) {
            return res.status(200).send({
                msg: "Order return request has been submitted",
                data: result,
            });
        }
        return res.status(400).send({ msg: "Order return request not submitted" });
    })
);
returnOrderRouter.get(
    "/list",
    expressAsyncHandler(async (req, res) => {
        const result = await returnOrderServices.returnOrderList();
        res.status(200).send({ msg: "Return Order ", data: result });
    })
);
returnOrderRouter.get(
    "/details",
    expressAsyncHandler(async (req, res) => {
        const { orderId } = req.query;
        const result = await returnOrderServices.returnOrderDetails(orderId);
        if (result) {
            return res.status(200).send({
                msg: "Order Details",
                data: result,
            });
        } else {
            return res.status(400).send({
                msg: "Order Not Found",
            });
        }
    })
);
returnOrderRouter.post(
    "/dispatchReturnOrder",
    expressAsyncHandler(async (req, res) => {
        const { status, orderId, message } = req.body;
        //console.log("Order ID", orderId, "Status", status);
        const result = await returnOrderServices.dispatchReturnOrder(
            status,
            orderId,
            message
        );
        if (result) {
            return res.status(200).send({
                msg: "Orders Status Successfully Updated",
            });
        } else {
            return res.status(400).send({ msg: "Order Not Dispatch" });
        }
    })
);
module.exports = returnOrderRouter;
