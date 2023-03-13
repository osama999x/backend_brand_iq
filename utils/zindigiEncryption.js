const crypto = require("crypto");
const fs = require("fs");
module.exports = (data) => {
  key = fs.readFileSync("zindigikey.txt").toString();

  const encryptedData = crypto.publicEncrypt(
    {
      key,
      padding: crypto.constants.RSA_PKCS1_PADDING,
    },
    Buffer.from(data.toString())
  );

  return encryptedData.toString("base64");
};
