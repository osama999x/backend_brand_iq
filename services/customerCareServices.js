const customerCareModel = require("../model/customerCareModel");
const customerCareResolvedModel = require("../model/customerCareResolvedModel");

const customerCareServices = {
  createComplaint: async (
    customerName,
    customerEmail,
    customerPhone,
    inquiry
  ) => {
    let complaint = new customerCareModel({
      customerName,
      customerEmail,
      customerPhone,
      inquiry,
    });
    const result = await complaint.save();
    return result;
  },
  getAllComplaints: async () => {
    const complaints = await customerCareModel.find({});
    return complaints;
  },
  getComplaint: async (id) => {
    const complaint = await customerCareModel.findById(id);
    return complaint;
  },
  resolveComplaint: async (id, resolution, complaint) => {
    const complaints = await customerCareModel.findByIdAndUpdate(
      id,
      { resolution, complaint, status: "Resolved" },
      { new: true }
    );
    return complaints;
  },
  //   resolveComplaint: async (id, resolution, complaint, status) => {
  //     let customerCare = await customerCareModel.findById(id);
  //     if (customerCare) {
  //       let resolvedComplaint = new customerCareResolvedModel({
  //         customerId: customerCare.customerId,
  //         productId: customerCare.productId,
  //         subject: customerCare.subject,
  //         description: customerCare.description,
  //         resolution: resolution,
  //         createdAt: customerCare.createdAt,
  //         updatedAt: customerCare.updatedAt,
  //       });
  //       const result = await resolvedComplaint.save();
  //       await customerCareModel.findByIdAndDelete(id);
  //       return result;
  //     } else {
  //       return null;
  //     }
  //   },
};

module.exports = customerCareServices;
