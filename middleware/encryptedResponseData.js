const decryptRequest = require("./decryptRequest");
const encryptRequest = require("./encryptRequest");

module.exports = (req, res, next) => {
  if (
    req.url.startsWith("/api/v1/test") ||
    req.url.endsWith("/payfast/checkout?") ||
    req.url.startsWith("/api-docs")
  ) {
    next();
    return;
  }
  const send = res.send;
  res.send = function (body) {
    send.call(this, JSON.stringify(encryptRequest(body)));
  };
  next();
};
