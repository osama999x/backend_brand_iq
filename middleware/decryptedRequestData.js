const encryptRequest = require("./encryptRequest");
const decryptedRequest = require("./decryptRequest");

module.exports = (req, res, next) => {
  if (
    req.method === "GET" ||
    req.method === "DELETE" ||
    req.url.startsWith("/api/v1/test") ||
    req.url.endsWith("/payfast/checkout?")
  ) {
    next();
    return;
  }
  const { cipher } = req.body;
  if (cipher == undefined) {
    res
      .status(400)
      .send(encryptRequest({ msg: "Please send data into cipher!" }));
    return;
  }
  const data = decryptedRequest(cipher);
  if (data) {
    req.body = data;
    next();
  } else {
    res.status(401).send(encryptRequest({ msg: "Not authorized" }));
  }
};
