const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const decryptRequest = require("../middleware/decryptRequest");
dotenv.config();
module.exports = (req, resp, next) => {
  let token = req.header("auth-token");
  token = decryptRequest(token);
  if (!token) {
    return resp.status(401).send("access denied");
  }
  try {
    const verified = jwt.verify(token, process.env.SECRET_KEY);
    const user = verified.user;
    if (req.body.user && req.body.user !== user) {
      throw "Invalid User";
    } else {
      next();
    }
  } catch (error) {
    resp.status(401).send("invalid token");
  }
};
