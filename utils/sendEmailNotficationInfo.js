const sendNotificationEmail = require("./sendNotificationEmail");

const sendEmailNotificationInfo = {
  orderResponse: {
    title: "MSAFA Order alert",
    body: "You order has been placed successfully",
  },
  returnOrder: {
    title: "MSAFA Order ",
  },
  login: {
    title: "MSAFA login alert",
    body: "You are successfully Logged in!",
  },
  otpSend: {
    title: "OTP alert",
    body: "OTP has been sent please check your mail!",
  },
  otpVerify: {
    title: "OTP alert",
    body: "OTP received",
  },
  review: {
    title: "Review alert",
    body: "Review has been submitted thank you!",
  },
  password: {
    title: "Password Alert",
    body: "Your password has been updated!",
  },
  coupon: {
    title: "MSAFA Coupon Alert",
    body: "MSAFA offering  a new coupon. Open coupon and get spacial discount on order ",
  },
  promotion: {
    title: "MSAFA Promotion Alert",
    body: "MSAFA offering promotion discount to customer. You can get benefits on promotion discount",
  },
  dealProduct: {
    title: "MSAFA Deal Offer Alert",
    body: "MSAFA offering spacial deal on spacial product. please visit MSAFA and get discount on deal",
  },
  product: {
    title: "MSAFA New Product Alert",
    body: "MSAFA add  a new ",
  },
};
module.exports = sendEmailNotificationInfo;
