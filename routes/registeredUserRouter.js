const express = require("express");
const expressAsyncHandler = require("express-async-handler");
const registeredUserRouter = express.Router();
const registeredUserServices = require("../services/registeredUserServices");
registeredUserRouter.get(
  "/all",
  expressAsyncHandler(async (req, resp) => {
    const result = await registeredUserServices.get();
    resp.status(200).send({
      msg: "Registered User",
      data: result,
    });
  })
);
registeredUserRouter.post(
  "/",
  expressAsyncHandler(async (req, resp) => {
    const { customerId, membershipId, status, isActive } = req.body;
    if (!customerId || !membershipId || !status) {
      resp.status(400).send({
        msg: "Fields Missing",
      });
    } else {
      const result = await registeredUserServices.addNew(
        customerId,
        membershipId,
        status,
        isActive
      );
      if (result.length != 0) {
        resp.status(200).send({
          msg: "Registered User added",
          data: result,
        });
      } else {
        resp.status(400).send({
          msg: "Registered User Not added",
        });
      }
    }
  })
);
module.exports = registeredUserRouter;
