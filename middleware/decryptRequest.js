var CryptoJS = require("crypto-js");
const decryptRequest = (data) => {
  // //let { cipher } = req.body;
  // var bytes = CryptoJS.AES.decrypt(data, process.env.SECRET_KEY);
  // var decryptedData = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
  // // req.body = decryptedData;
  // return decryptedData;
  const cryptkey = CryptoJS.enc.Utf8.parse(process.env.CRYPTKEY);

  const cryptiv = CryptoJS.enc.Utf8.parse(process.env.CRYPTIV);
  const crypted = CryptoJS.enc.Base64.parse(data.toString()); //"Zt8VfHQqiKj/MToZGwWppw==");

  var decrypt = CryptoJS.AES.decrypt({ ciphertext: crypted }, cryptkey, {
    iv: cryptiv,
    mode: CryptoJS.mode.CTR,
  });

  const data2 = decrypt.toString(CryptoJS.enc.Utf8);
  if (data2) return JSON.parse(data2);
  return null;
};
module.exports = decryptRequest;
