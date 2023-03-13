const express = require("express");
const expressAsyncHandler = require("express-async-handler");
const deliveryPartnerServices = require("../services/deliveryPartnerServices");
const uploadFile = require("../utils/uploadFile");
const deliveryPartnerRouter = express.Router();
deliveryPartnerRouter.get(
  "/all",
  expressAsyncHandler(async (req, res) => {
    const result = await deliveryPartnerServices.get();
    res.status(200).send({
      msg: "Delivery Partner",
      data: result,
    });
  })
);
deliveryPartnerRouter.get(
  "/deliverPartnerList",
  expressAsyncHandler(async (req, res) => {
    const result = await deliveryPartnerServices.getDeliveryPartnerList();
    if (result.length != 0) {
      return res.status(200).send({
        msg: "Delivery Partners",
        data: result,
      });
    } else {
      return res.status(400).send({ msg: "Delivery Partner Not Found" });
    }
  })
);
deliveryPartnerRouter.post(
  "/",
  expressAsyncHandler(async (req, res) => {
    const { organization, organizationHead, organizationRepresentative } =
      req.body;
    if (!organization || !organizationHead || !organizationRepresentative) {
      return res.status(400).send({ msg: "Fields Missing" });
    }
    const headImage = await uploadFile(organizationHead.image);
    const representativeImage = await uploadFile(
      organizationRepresentative.image
    );
    organizationHead.image = headImage;
    organizationRepresentative.image = representativeImage;
    const result = await deliveryPartnerServices.addNew(
      organization,
      organizationHead,
      organizationRepresentative
    );
    if (result) {
      return res
        .status(200)
        .send({ msg: "Delivery Partner added.", data: result });
    } else {
      return res.status(400).send({ msg: "Delivery Partner not added" });
    }
  })
);

deliveryPartnerRouter.patch(
  "/",
  expressAsyncHandler(async (req, res) => {
    const {
      deliveryPartnerId,
      organization,
      organizationHead,
      organizationRepresentative,
    } = req.body;

    const headImage = await uploadFile(organizationHead.image);
    const representativeImage = await uploadFile(
      organizationRepresentative.image
    );
    organizationHead.image = headImage;
    organizationRepresentative.image = representativeImage;
    const result = await deliveryPartnerServices.update(
      deliveryPartnerId,
      organization,
      organizationHead,
      organizationRepresentative
    );
    if (result) {
      return res
        .status(200)
        .send({ msg: "Delivery Partner updated.", data: result });
    } else {
      return res.status(400).send({ msg: "Delivery Partner not updated" });
    }
  })
);
deliveryPartnerRouter.delete(
  "/",
  expressAsyncHandler(async (req, res) => {
    const { deliveryPartnerId } = req.body;
    const result = await deliveryPartnerServices.delete(deliveryPartnerId);
    if (result.deletedCount == 0) {
      return res.status(400).send({ msg: "ID Not found" });
    }
    if (result) {
      return res
        .status(200)
        .send({ msg: "Delivery Partner deleted.", data: result });
    } else {
      return res.status(400).send({ msg: "Delivery Partner not deleted" });
    }
  })
);

module.exports = deliveryPartnerRouter;
