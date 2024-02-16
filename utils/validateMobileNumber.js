module.exports = function validateMobileNumber(mobileNumber) {
    // regex pattern for Canadian mobile numbers
    const regex = /^1[0-9]{10}$/;
    return regex.test(mobileNumber);
};
