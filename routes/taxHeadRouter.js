const express = require("express");
const expressAsyncHandler = require("express-async-handler");
const productsServices = require("../services/productsServices");
const taxHeadServices = require("../services/taxHeadServices");
const taxHeadRouter = express.Router();

taxHeadRouter.get(
    "/",
    expressAsyncHandler(async (req, res) => {
        const result = await taxHeadServices.get();
        res.status(200).send({
            msg: "Tax Heads",
            data: result,
        });
    })
);
taxHeadRouter.get(
    "/getOne",
    expressAsyncHandler(async (req, res) => {
        const { taxHeadId } = req.query;
        const result = await taxHeadServices.getOne(taxHeadId);
        if (result) {
            return res.status(200).send({
                msg: "Tax Types",
                data: result,
            });
        } else {
            return res.status(400).send({ msg: "Tax Types Not Found" });
        }
    })
);
taxHeadRouter.get(
    "/getByTaxType",
    expressAsyncHandler(async (req, res) => {
        const { taxTypeId } = req.query;
        const result = await taxHeadServices.getByTaxType(taxTypeId);
        if (result) {
            return res.status(200).send({
                msg: "Tax Types",
                data: result,
            });
        } else {
            return res.status(400).send({ msg: "Tax Types Not Found" });
        }
    })
);
taxHeadRouter.post(
    "/",
    expressAsyncHandler(async (req, res) => {
        const { taxTypeId, taxHead, description } = req.body;
        if (!taxTypeId || !taxHead || !description) {
            return res.status(400).send({ msg: "Missing Fields" });
        }
        const result = await taxHeadServices.add(taxTypeId, taxHead, description);
        if (result) {
            return res.status(200).send({
                msg: "Tax Head Added.",
                data: result,
            });
        } else {
            return res.status(400).send({ msg: "Tax Head not Added." });
        }
    })
);

taxHeadRouter.patch(
    "/",
    expressAsyncHandler(async (req, res) => {
        const { taxHeadId, taxTypeId, taxHead, description } = req.body;
        if (!taxHeadId || !taxTypeId || !taxHead || !description) {
            return res.status(400).send({ msg: "Missing Fields" });
        }
        const result = await taxHeadServices.update(
            taxHeadId,
            taxTypeId,
            taxHead,
            description
        );
        if (result) {
            return res.status(200).send({ msg: "Tax Head Updated.", data: result });
        } else {
            return res.status(400).send({ msg: "Tax Head not Updated" });
        }
    })
);
taxHeadRouter.post(
    "/tax",
    expressAsyncHandler(async (req, res) => {
        const { product } = req.body;
        const result = await productsServices.calculateTax(product);
        if (result) {
            return res.status(200).send({ msg: "Tax ", data: result });
        } else {
            return res.status(400).send({ msg: "Tax Not Calculated!" });
        }
    })
);
taxHeadRouter.delete(
    "/",
    expressAsyncHandler(async (req, res) => {
        const { taxHeadId } = req.body;
        const result = await taxHeadServices.delete(taxHeadId);
        if (result.deletedCount == 0) {
            return res.status(400).send({ msg: "ID Not found" });
        }
        if (result) {
            return res.status(200).send({ msg: "Tax Deleted.", data: result });
        } else {
            return res.status(400).send({ msg: "Tax not Deleted" });
        }
    })
);

module.exports = taxHeadRouter;
