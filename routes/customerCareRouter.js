const { response } = require("express");
const express = require("express");
const expressAsyncHandler = require("express-async-handler");
const customerCareServices = require("../services/customerCareServices");
const customerCareRouter = express.Router();
//  customerName: { type: String, required: true },
//     customerEmail: { type: String, required: true },
//     customerPhone: { type: String },
//     inquiry: { type: String, required: true },
//     complaint: { type: String },
//     resolution: { type: String },
//     status: { type: String, default: "Open" },
customerCareRouter.post(
  "/create-complaint",
  expressAsyncHandler(async (req, res) => {
    const { customerName, customerEmail, customerPhone, inquiry } = req.body;
    if (!customerName || !customerEmail || !customerPhone || !inquiry) {
      return res.status(400).send({ msg: "Fields Missing" });
    }
    const result = await customerCareServices.createComplaint(
      customerName,
      customerEmail,
      customerPhone,
      inquiry
    );
    if (result) {
      return res.status(200).send({ msg: "complaint created", data: result });
    } else {
      return res.status(400).send({ msg: "complaint not created" });
    }
  })
);

customerCareRouter.get(
  "/get-all-complaints",
  expressAsyncHandler(async (req, res) => {
    const complaints = await customerCareServices.getAllComplaints();
    if (complaints) {
      return res.status(200).send({ msg: "complaints", data: complaints });
    } else {
      return res.status(400).send({ msg: "no complaints found" });
    }
  })
);

customerCareRouter.get(
  "/get-complaint",
  expressAsyncHandler(async (req, res) => {
    const { id } = req.query;
    const complaint = await customerCareServices.getComplaint(id);
    if (complaint) {
      return res.status(200).send({ msg: "complaint", data: complaint });
    } else {
      return res.status(400).send({ msg: "complaint not found" });
    }
  })
);

// customerCareRouter.put(
//   "/update-complaint/:id",
//   expressAsyncHandler(async (req, res) => {
//     const { id } = req.params;
//     const { status } = req.body;
//     const result = await customerCareServices.updateComplaint(id, status);
//     if (result) {
//       return res.status(200).send({ msg: "complaint updated", data: result });
//     } else {
//       return res.status(400).send({ msg: "complaint not updated" });
//     }
//   })
// );
customerCareRouter.patch(
  "/resolve-complaint",
  expressAsyncHandler(async (req, res) => {
    const { id, resolution, complaint } = req.body;
    if (!resolution) {
      return res.status(400).send({ msg: "Fields Missing" });
    }
    const result = await customerCareServices.resolveComplaint(
      id,
      resolution,
      complaint
    );
    if (result) {
      return res.status(200).send({ msg: "complaint resolved", data: result });
    } else {
      return res.status(400).send({ msg: "complaint not resolved" });
    }
  })
);

module.exports = customerCareRouter;
