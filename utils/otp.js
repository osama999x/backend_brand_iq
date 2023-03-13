const otp = () => {
  const OTP = Math.floor(Math.random() * 10000 + 10000)
    .toString()
    .substring(1);
  return OTP;
};
module.exports = otp;
