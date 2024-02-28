const express = require("express");
const expressAsyncHandler = require("express-async-handler");
const deliveryServices = require("../services/deliveryServices");
const deliveryChargesRouter = express.Router();

deliveryChargesRouter.get(
    "/",
    expressAsyncHandler(async (req, res) => {
        const result = await deliveryServices.getAll();
        if (!result) {
            return res.status(404).send("Delivery charges not found.");
        } else {

            res.status(200).send({ msg: "Delivery Charges", data: result, });
        }
    })
);
deliveryChargesRouter.get(
    "/getOne",
    expressAsyncHandler(async (req, res) => {
        const { id } = req.query;
        const result = await deliveryServices.getById(id);
        if (result) {
            return res.status(200).send({
                msg: "Delivery Charges",
                data: result,
            });
        } else {
            return res.status(404).send({ msg: "Delivery Charges Not Found" });
        }
    })
);
deliveryChargesRouter.post(
    "/",
    expressAsyncHandler(async (req, res) => {
        const { Region, Charges } = req.body;
        if (!Region || !Charges) {
            return res.status(400).send({ msg: "Missing Fields" });
        }
        const result = await deliveryServices.addDeliveryCharge(Region, Charges);
        if (result) {
            return res.status(200).send({
                msg: "Delivery Charges Added.",
                data: result,
            });
        } else {
            return res.status(400).send({ msg: "Delivery Charges Not added" });
        }
    })
);

deliveryChargesRouter.patch(
    "/:id",
    expressAsyncHandler(async (req, res) => {
        const id = req.params.id;
        const { Region, Charges } = req.body;
        console.log(req.body);
        if (!Region || !Charges) {
            return res.status(400).send({ msg: "Missing Fields" });
        }
        const result = await deliveryServices.update(id, Region, Charges);
        if (result) {
            return res.status(200).send({ msg: "Delivery Charges Updated.", data: result });
        } else {
            return res.status(400).send({ msg: "Delivery Charges not Updated" });
        }
    })
);
deliveryChargesRouter.delete(
    "/",
    expressAsyncHandler(async (req, res) => {
        const { _id } = req.body;
        const result = await deliveryServices.delete(_id);
        if (result.deletedCount == 0) {
            return res.status(400).send({ msg: "ID Not found" });
        }
        if (result) {
            return res.status(200).send({ msg: "Delivery Charges Deleted.", data: result });
        } else {
            return res.status(400).send({ msg: "Delivery Charges not Deleted" });
        }
    })
);

module.exports = deliveryChargesRouter;
