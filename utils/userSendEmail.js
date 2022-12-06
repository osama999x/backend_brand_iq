var nodemailer = require("nodemailer");
const userResetPasswordModel = require("../model/userResetPaswordModel");

const userSendEmail = async (email) => {
  var otp = Math.floor(Math.random() * 10000 + 10000)
    .toString()
    .substring(1);

  var transporter = nodemailer.createTransport({
    host: process.env.MAILHOST,
    port: process.env.MAILPORT,
    auth: {
      user: process.env.MAIL,
      pass: process.env.MAILPASS,
    },
  });

  // var transporter = nodemailer.createTransport({
  //   service: "gmail",
  //   auth: {
  //     user: "hkhan7017@@gmail.com",
  //     pass: "ybgycemeqpjjgkge",
  //   },
  // });

  var mailOptions = {
    from: "Z-Store",
    to: email,
    subject: "Z-Store OTP",
    text: "Your OTP is " + otp,
  };
  result = await transporter.sendMail(mailOptions);
  //If email is sent
  if (result) {
    reset = new userResetPasswordModel({
      email,
      otp,
    });
    const reslt = await reset.save();
    let list = [email, otp];
    return list;
  }
  //if email is not sent
  return null;
};
module.exports = userSendEmail;
