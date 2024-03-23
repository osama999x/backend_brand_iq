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
        from: "Shopeez",
        to: email,
        subject: "Shopeez OTP",
        text: `Dear User,

    Thank you for registering with Shopeez.

    Your OTP for Email verification is as below.
    To ensure the security of your Account, we have generated a One-Time Password (OTP) for your authentication.

    Your OTP is: ${Otp}. (Please do not share this code with anyone)...
    This OTP will expire in 3 minutes.

    If you did not request this code, please ignore this email.

    For any assistance or concerns, please contact our support team at Shopeez. `,
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
