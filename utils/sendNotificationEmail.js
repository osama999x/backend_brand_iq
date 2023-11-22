var nodemailer = require("nodemailer");
const SubscribeModel = require("../model/subscribeModel");
const sendNotificationEmail = async (subject, text, email) => {
  var emailArr = [];
  if (email) {
    email = email;
    emailArr[0] = email;
  } else {
    let userEmail = await SubscribeModel.find({}, { email: 1, _id: 0 });
    for (var i of userEmail) {
      email = i.email;
      console.log("email", email);
      emailArr.push(email);
    }
  }
  console.log("emails", emailArr);
  var transporter = nodemailer.createTransport({
    host: process.env.MAILHOST,
    port: process.env.MAILPORT,
    secure: false,
    auth: {
      user: process.env.MAIL,
      pass: process.env.MAILPASS,
    },
  });
  var mailOptions = {
    from: `MSAFA ${process.env.MAIL}`,
    to: emailArr,
    subject: subject,
    text: text,
  };
  if (emailArr.length != 0) {
    result = await transporter.sendMail(mailOptions);
  }
};
module.exports = sendNotificationEmail;
