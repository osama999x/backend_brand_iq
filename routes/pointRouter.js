const express = require("express");
const expressAsyncHandler = require("express-async-handler");
const pointServices = require("../services/pointServices");
const pointRouter = express.Router();

pointRouter.post(
    "/customerOrderPoints",

    expressAsyncHandler(async (req, res) => {
        const { customerId, date } = req.body;
        console.log(req.body);
        if (!customerId) {
            res.status(400).send({
                msg: "Failed Missing",
            });
            return;
        }

        const result = await pointServices.customerOrderPoints(customerId, date);

        if (result.orderDetails.length !== 0 || result.totalPoints.length !== 0) {
            res.status(200).send({
                msg: "Points",
                data: result,
            });
        } else {
            res.status(400).send({ msg: "Order Points Not Found" });
        }
    })
);



pointRouter.get(
    "/orderPoints",
    expressAsyncHandler(async (req, res) => {
        const { orderId } = req.query;
        const result = await pointServices.orderPoints(orderId);
        if (result) {
            return res.status(200).send({
                msg: "Points",
                data: result,
            });
        } else {
            return res.status(400).send({ msg: "Order Points Not Found" });
        }
    })
);
pointRouter.get(
    "/customerOrderPoints",
    expressAsyncHandler(async (req, res) => {
        const { customerId } = req.query;
        const result = await pointServices.customerTotalPoints(customerId);
        if (result) {
            return res.status(200).send({
                msg: "Customer Order Points",
                data: result,
            });
        } else {
            return res.status(400).send({ msg: "Customer Order Points Not Found" });
        }
    })
);
module.exports = pointRouter;
