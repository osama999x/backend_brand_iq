var CryptoJS = require("crypto-js");

const cipherServices = {
  decrypt: async (cipher) => {
    const cryptkey = CryptoJS.enc.Utf8.parse(process.env.CRYPTKEY);
    const cryptiv = CryptoJS.enc.Utf8.parse(process.env.CRYPTIV);
    const crypted = CryptoJS.enc.Base64.parse(cipher.toString()); //"Zt8VfHQqiKj/MToZGwWppw==");
    var decrypt = CryptoJS.AES.decrypt({ ciphertext: crypted }, cryptkey, {
      iv: cryptiv,
      mode: CryptoJS.mode.CTR,
    });
    const data2 = decrypt.toString(CryptoJS.enc.Utf8);
    if (data2) return JSON.parse(data2);
    return null;
  },
  encrypt: async (data) => {
    const cryptkey = CryptoJS.enc.Utf8.parse(process.env.CRYPTKEY);
    const cryptiv = CryptoJS.enc.Utf8.parse(process.env.CRYPTIV);
    var encrypt = CryptoJS.AES.encrypt(JSON.stringify(data), cryptkey, {
      iv: cryptiv,
      mode: CryptoJS.mode.CTR,
    });
    const cipher = encrypt.toString();
    return cipher;
  },
};

module.exports = cipherServices;
//encrypt:{
// var bytes = CryptoJS.AES.decrypt(cipher, process.env.SECRET_KEY);
// var decryptedData = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
// return decryptedData;
//}
// decrypt:{
//      var ciphertext = CryptoJS.AES.encrypt(
//        JSON.stringify(data),
//        process.env.SECRET_KEY
//      ).toString();
//      return ciphertext;
// }
