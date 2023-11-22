var nodemailer = require("nodemailer");
const userModel = require("../model/userModel");
const userResetPasswordModel = require("../model/userResetPaswordModel");
const otp = require("./otp");
const saveOtp = require("./saveOtp");
const smsServices = require("./sendSMS");
const userSendEmail = async (email) => {
  const Otp = otp();
  var transporter = nodemailer.createTransport({
    host: process.env.MAILHOST,
    port: process.env.MAILPORT,
    auth: {
      user: process.env.MAIL,
      pass: process.env.MAILPASS,
    },
  });
  var mailOptions = {
    from: "MSAFA",
    to: email,
    subject: "MSAFA OTP",
    text: "Your OTP is " + Otp,
  };
  let user = await saveOtp.adminOtpById(email, Otp);
  //If email is sent
  if (user) {
    let userContact = await userModel.findOne({ email: email }, { contact: 1 });
    await smsServices.sendSMS(userContact.contact, Otp);
    result = await transporter.sendMail(mailOptions);
    console.log(email, Otp);
    let list = [email, Otp];
    return list;
  }
  //if email is not sent
  return null;
};
module.exports = userSendEmail;
