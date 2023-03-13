const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const CustomerCareSchema = new Schema(
  {
    customerName: { type: String, required: true },
    customerEmail: { type: String, required: true },
    customerPhone: { type: String },
    inquiry: { type: String, required: true },
    complaint: { type: String },
    resolution: { type: String },
    status: { type: String, default: "Open" },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);
const CustomerCareModel = new mongoose.model(
  "CustomerCare",
  CustomerCareSchema
);
module.exports = CustomerCareModel;
//the inquiry field is used to store the initial inquiry or question that a customer has when they contact the customer care center.
//It could be a question about a product or service, a shipping issue, or any other inquiry that the customer has.

//The resolution field is used to store any resolution or solution that is provided to the customer in response to their inquiry.
//This could be an answer to their question, a solution to their problem, or any other relevant information that is provided to the customer.

//complaint field is used to store any complaints that a customer has regarding the product or service provided by the e-commerce website.

//status field is used to store the current status of the customer inquiry or complaint, whether it is "Open" or "Closed", and it could be used to track the progress of the customer request.
