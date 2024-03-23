const { default: axios } = require("axios");
const smsServices = {
    sendSMS: async (PhoneNumber, Message, RequestedDateTime = new Date()) => {
        if (PhoneNumber.length === 11) {
            PhoneNumber = "92" + PhoneNumber.slice(1);
        }
        console.log({ PhoneNumber, RequestedDateTime, Message });
        if (Message) {
            Message = `Your Shopeez otp is ${Message}`;
        }
        try {
            const Request = {
                UserName: process.env.SMSUserName,
                Password: process.env.SMSPassword,
                Message,
                PhoneNumber,
                RequestedDateTime,
            };
            const res = await axios.post(process.env.SMSURL, Request);
            console.log(res.data);
            return res;
        } catch (error) {
            console.log(error);
            return { msg: error.message };
        }
    },
};
module.exports = smsServices;
