module.exports = function validateMobileNumber(contact) {
    // regex pattern for mobile numbers starting with +1 or 03, allowing 10 or 11 digits
    const regex = /^(?:\+1|03)[0-9]{9,11}$/;
    return regex.test(contact);
};
