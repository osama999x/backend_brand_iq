var nodemailer = require("nodemailer");
const resetPasswordModel = require("../model/resetPasswordModel");

const sendEmail = async (email) => {
  // var otp = 1111;
  var otp = Math.floor(Math.random() * 10000 + 10000)
    .toString()
    .substring(1);

  var transporter = nodemailer.createTransport({
    host: process.env.MAILHOST,
    port: process.env.MAILPORT,
    secure: false,
    auth: {
      user: process.env.MAIL,
      pass: process.env.MAILPASS,
    },
  });
  //me
  // user: "b18a05acfef5ec",
  //       pass: "02111fbf35a0cd",
  //not me
  // "33a56286703d6c",
  //     pass: "8516845217e803"
  // var transporter = nodemailer.createTransport({
  //   service: "gmail",
  //   auth: {
  //     user: "hkhan7017@@gmail.com",
  //     pass: "ybgycemeqpjjgkge",
  //   },
  // });

  var mailOptions = {
    from: `M-SAFA ${process.env.MAIL}`,
    to: email,
    subject: "M-SAFA OTP",
    text: "Your OTP is " + otp,
  };
  result = await transporter.sendMail(mailOptions);
  //If email is sent
  if (result) {
    let reset = new resetPasswordModel({
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
module.exports = sendEmail;
