const jwtServices = require("../utils/jwtService");
const encryptRequest = require("./encryptRequest");

module.exports = async (req, res, next) => {
  if (
    req.url.startsWith("/api/v1/test") ||
    req.url.startsWith("/api-docs") ||
    req.url.endsWith("/login") ||
    req.url.endsWith("refreshToken")

    // req.url.endsWith("refreshToken") ||
    // req.url.endsWith("verifymobile") ||
    // req.url.endsWith("register") ||
    // req.url.endsWith("sendotp") ||
    // req.url.endsWith("otprequest") ||
    // req.url.endsWith("resetpassword") ||
    // req.url.endsWith("livelocation")
  ) {
    next();
    return;
  }

  const authorization = req.headers.authorization;
  if (authorization) {
    try {
      const token = authorization.slice(7, authorization.length); // Bearer XXXXXX
      if (token) {
        tokenData = jwtServices.authenticate(token);
        if (tokenData) {
          next();
          return;
        } else {
          res
            .status(401)
            .send(encryptRequest({ msg: "Authentication failed!" }));
          return;
        }
      } else {
        res.status(401).send(encryptRequest({ msg: "Authentication failed!" }));
        return;
      }
    } catch (error) {
      if (error.message == "jwt expired") {
        res.status(401).send(encryptRequest({ msg: "Authentication failed" }));
        return;
      } else {
        res.status(401).send({ msg: error.message });
        return;
      }
    }
  } else {
    res.status(401).send(encryptRequest({ msg: "Authentication failed!" }));
    return;
  }
};
