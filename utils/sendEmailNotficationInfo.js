const sendNotificationEmail = require("./sendNotificationEmail");

const sendEmailNotificationInfo = {
  orderResponse: {
    title: "M-Safa Order alert",
    body: "You order has been placed succesfully",
  },
  returnOrder: {
    title: "M-Safa Order ",
  },
  login: {
    title: "M-Safa login alert",
    body: "You are succesfully Logged in!",
  },
  otpSend: {
    title: "OTP alert",
    body: "OTP has been sent please check your mail!",
  },
  otpVerify: {
    title: "OTP alert",
    body: "OTP recieved",
  },
  review: {
    title: "Review alert",
    body: "Rview has been submitted thank you!",
  },
  password: {
    title: "Password Alert",
    body: "Your password has been updated!",
  },
  coupon: {
    title: "M-Safa Coupon Alert",
    body: "M-Safa offering  a new coupon. Open coupon and get spacial discount on order ",
  },
  promotion: {
    title: "M-Safa Promotion Alert",
    body: "M-Safa offering promtion discount to customer. You can get benifits on promotion discount",
  },
  dealProduct: {
    title: "M-Safa Deal Offer Alert",
    body: "M-Safa offering spacial deal on spacial product. please visit M-Safa and get discount on deal",
  },
  product: {
    title: "M-Safa New Product Alert",
    body: "M-Safa add  a new ",
  },
};
module.exports = sendEmailNotificationInfo;
