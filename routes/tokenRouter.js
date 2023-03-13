const express = require("express");
const tokenRouter = express.Router();
const verifyToken = require("../utils/verfyToken");
const jwt = require("jsonwebtoken");
const customerModel = require("../model/customerModel");
const expressAsyncHandler = require("express-async-handler");
const encryptRequest = require("../middleware/encryptRequest");
const decryptRequest = require("../middleware/decryptRequest");
const jwtService = require("../utils/jwtService");
const authIdServices = require("../services/authIdServices");
tokenRouter.post(
  "/refreshToken",
  expressAsyncHandler(async (req, res) => {
    const { refreshToken } = req.body;
    const verifyToken = jwtService.authenticate(refreshToken);
    if (verifyToken) {
      const { uuid, type } = verifyToken;
      const AuthId = await authIdServices.findByUUID(uuid);
      if (AuthId) {
        const { userId } = AuthId;
        if (userId) {
          const token = jwtService.create({ userId, type }, "5m");
          res.status(200).send({ msg: "Token", token });
        } else {
          res.status(401).send({ msg: "Login please" });
        }
      } else {
        res.status(401).send({ msg: "Login please" });
      }
    } else {
      res.status(401).send({ msg: "Login please" });
    }
  })
);
// tokenRouter.post(
//   "/refreshToken",
//   verifyToken,
//   expressAsyncHandler(async (req, res) => {
//     const { email } = req.body;
//     const user = await customerModel.findOne({ email: email });
//     if (!user) {
//       res.status(400).send({ msg: "User doesn't exist" });
//     } else {
//       let refrestKoken = jwt.sign(
//         {
//           email: user.email,
//         },
//         process.env.SECRET_KEY,
//         {
//           expiresIn: "5m",
//         }
//       );
//       refrestKoken = encryptRequest(refrestKoken);
//       res.status(200).send({
//         msg: "Refresh Token",
//         refreshToken: refrestKoken,
//       });
//     }
//   })
// );
module.exports = tokenRouter;
