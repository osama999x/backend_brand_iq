const express = require("express");
const expressAsyncHandler = require("express-async-handler");
const favouriteServices = require("../services/favouriteServices");
const favouriteRouter = express.Router();

favouriteRouter.get(
    "/customer?",
    expressAsyncHandler(async (req, res) => {
        const { customerId } = req.query;
        const result = await favouriteServices.getFavourites(customerId);
        res.status(200).send({ msg: "Favourites", data: result });
    })
);
// favouriteRouter.get(
//   "/favouriteProductList",
//   expressAsyncHandler(async (req, res) => {
//     const result = await favouriteServices.getFavouriteList();
//     if (result.length !== 0) {
//       res.status(200).send({ msg: "Favourites", data: result });
//     } else {
//       res.status(400).send({ msg: "Favourites Not found" });
//     }
//   })
// );

favouriteRouter.post(
    "/",
    expressAsyncHandler(async (req, res) => {
        const { customerId, productId } = req.body;
        if (!customerId || !productId) {
            return res.status(400).send({ msg: "Fields Missing" });
        }
        const result = await favouriteServices.add(customerId, productId);
        if (result) {
            return res.status(200).send({ msg: "Added to Wishlist.", data: result });
        } else {
            return res.status(400).send({ msg: "Favourite not Added" });
        }
    })
);

favouriteRouter.delete(
    "/",
    expressAsyncHandler(async (req, res) => {
        const { favouriteId } = req.body;
        const result = await favouriteServices.delete(favouriteId);
        if (result) {
            return res.status(200).send({ msg: "Removed From Wishlist.", data: result });
        } else {
            return res.status(400).send({ msg: "Favourite Not Deleted" });
        }
    })
);

module.exports = favouriteRouter;
