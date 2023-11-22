module.exports = function validateMobileNumber(mobileNumber) {
  const regex = /^03\d{9}$/; // regex pattern for mobile numbers starting with "03" and consisting of 11 digits
  return regex.test(mobileNumber);
};
