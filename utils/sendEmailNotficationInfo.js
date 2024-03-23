const sendNotificationEmail = require("./sendNotificationEmail");

const sendEmailNotificationInfo = {
    orderResponse: {
        title: "Your order has been placed!",
    },
    returnOrder: {
        title: "Shopeez Order ",
    },
    login: {
        title: "Shopeez login alert",
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
        title: "Shopeez Coupon Alert",
        body: "Shopeez offering  a new coupon. Open coupon and get spacial discount on order ",
    },
    promotion: {
        title: "Shopeez Promotion Alert",
        body: "Shopeez offering promotion discount to customer. You can get benefits on promotion discount",
    },
    dealProduct: {
        title: "Shopeez Deal Offer Alert",
        body: "Shopeez offering spacial deal on spacial product. please visit Shopeez and get discount on deal",
    },
    product: {
        title: "Shopeez New Product Alert",
        body: "Shopeez add  a new ",
    },
};
module.exports = sendEmailNotificationInfo;
