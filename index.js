const express = require("express");
const limiter = require("./middleware/iplimitMiddleware");
const dotenv = require("dotenv");
var fs = require("fs");
var path = require("path");
var multer = require("multer");
var morgan = require("morgan");
var cors = require("cors");
const var_dump = require("var_dump");
const uc = require("upper-case-first");
const bodyParser = require("body-parser");
// var CryptoJS = require("crypto-js");
//process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
const app = express();
dotenv.config();
// in latest body-parser use like below.
//app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.urlencoded({ extended: true }));
const userRouter = require("./routes/userRouter");
const roleRouter = require("./routes/roleRouter");
const taxTypeRouter = require("./routes/taxTypeRouter");
const taxHeadRouter = require("./routes/taxHeadRouter");
const customerRouter = require("./routes/customerRouter");
const categoryRouter = require("./routes/categoryRouter");
const subCategoryRouter = require("./routes/subCategoryRouter");
const productsRouter = require("./routes/productsRouter");
const discountRouter = require("./routes/discountRouter");
const permissionRouter = require("./routes/permissionRouter");
const membershipRouter = require("./routes/membershipRouter");
const pointsRouter = require("./routes/pointsRouter");
const feeSlabRouter = require("./routes/feeSlabRouter");
const feePolicyRouter = require("./routes/feePolicyRouter");
const deliveryPartnerRouter = require("./routes/deliveryPartnerRouter");
const reviewRouter = require("./routes/reviewRouter");
const registeredUserRouter = require("./routes/registeredUserRouter");
const orderRouter = require("./routes/orderRouter");
const homeRouter = require("./routes/homeRouter");
const cipherRouter = require("./routes/cipherRouter");
const favouriteRouter = require("./routes/favouriteRouter");
const feedbackRouter = require("./routes/feedbackRouter");
const inventoryStatusRouter = require("./routes/inventoryStatusRouter");
const testRouter = require("./routes/testRouter");
const orderStatusRouter = require("./routes/orderStatusRouter");
const addToCartRouter = require("./routes/addToCartRouter");
const pointRouter = require("./routes/pointRouter");
const webSignupLogRouter = require("./routes/webSignupLogRouter");
const pointManageRouter = require("./routes/pointManageRouter");
const bannerRouter = require("./routes/bannerRouter");
const notificatinoRouter = require("./routes/notificationRouter");
const membershipBenifitRouter = require("./routes/membershipBenifitRouter");
const couponPolicyRouter = require("./routes/couponPolicyRouter");
const tokenRouter = require("./routes/tokenRouter");
const subscribeRouter = require("./routes/subscribeRouter");
const promotionCampaignRouter = require("./routes/promotionCampaignRouter");
const dealRouter = require("./routes/dealRouter");
const zindigiWalletRouter = require("./routes/zindigiWalletRouter");
const returnOrderRouter = require("./routes/returnOrderRouter");
const { getLogger } = require("nodemailer/lib/shared");
const logger = require("./config/logger");
const paymentRouter = require("./routes/paymentRouter");
const customerCareRouter = require("./routes/customerCareRouter");
const swaggerjsdoc = require("swagger-jsdoc");
const swaggeruiexpress = require("swagger-ui-express");
const swaggerDocs = require("./utils/swagger");
const permissionActionRouter = require("./routes/permissionActionRouter");
const moduleRouter = require("./routes/ModuleRouter");
const subModuleRouter = require("./routes/subModuleRouter");
const { authenticate } = require("./utils/jwtService");
const authentication = require("./middleware/authentication");
const decryptRequest = require("./middleware/decryptedRequestData");
const encryptRequest = require("./middleware/encryptedResponseData");
const rolePermissionRouter = require("./routes/rolePermissionRouter");
require("./db/index");
const port = process.env.PORT;
//hit routes
app.use((req, res, next) => {
  console.log(`Route called: ${req.originalUrl}`);
  next();
});
app.use(express.json({ limit: "50mb" }));
app.use(express.static("public"));
app.use(express.static(path.join(__dirname, "public")));
//app.use(decryptData);//Cipher
//app.use(limiter); //Limit IP Requests
app.use(morgan("dev"));
//logger
app.use((req, res, next) => {
  logger.info(req._parsedUrl.path);
  logger.info(req.body);
  let oldres = res.send;
  res.send = function (data) {
    logger.info(data);
    oldres.apply(res, arguments);
  };
  next();
});
var corOptions = {
  origin: "*",
};
//cors
app.use(cors(corOptions));
//test Router
//authentication
//app.use(authentication);
//app.use(decryptRequest);
//app.use(encryptRequest);
app.use("/api/v1/test", testRouter);
//api paths
app.use("/api/v1/cipher", cipherRouter);
app.use("/api/v1/customer", customerRouter);
app.use("/api/v1/user", userRouter);
app.use("/api/v1/role", roleRouter);
app.use("/api/v1/permission", permissionRouter);
app.use("/api/v1/category", categoryRouter);
app.use("/api/v1/subcategory", subCategoryRouter);
app.use("/api/v1/products", productsRouter);
app.use("/api/v1/order", orderRouter);
app.use("/api/v1/home", homeRouter);
app.use("/api/v1/favourites", favouriteRouter);
app.use("/api/v1/review", reviewRouter);
app.use("/api/v1/registeredUser", registeredUserRouter);
app.use("/api/v1/tax/type", taxTypeRouter);
app.use("/api/v1/tax/head", taxHeadRouter);
app.use("/api/v1/discount", discountRouter);
app.use("/api/v1/promotion", promotionCampaignRouter);
app.use("/api/v1/membership", membershipRouter);
app.use("/api/v1/points", pointsRouter);
app.use("/api/v1/coupon", couponPolicyRouter);
app.use("/api/v1/feeslab", feeSlabRouter);
app.use("/api/v1/feepolicy", feePolicyRouter);
app.use("/api/v1/deliverypartner", deliveryPartnerRouter);
app.use("/api/v1/review", reviewRouter);
app.use("/api/v1/registeredUser", registeredUserRouter);
app.use("/api/v1/order", orderRouter);
app.use("/api/v1/home", homeRouter);
app.use("/api/v1/favourites", favouriteRouter);
app.use("/api/v1/feedback", feedbackRouter);
app.use("/api/v1/inventoryStatus", inventoryStatusRouter);
app.use("/api/v1/orderStatus", orderStatusRouter);
app.use("/api/v1/addToCart", addToCartRouter);
app.use("/api/v1/pointManage", pointManageRouter);
app.use("/api/v1/point", pointRouter);
app.use("/api/v1/webLog", webSignupLogRouter);
app.use("/api/v1/banner", bannerRouter);
app.use("/api/v1/notification", notificatinoRouter);
app.use("/api/v1/membershipBenifit", membershipBenifitRouter);
app.use("/api/v1/dealsProduct", dealRouter);
app.use("/api/v1/token", tokenRouter);
app.use("/api/v1/subscribe", subscribeRouter);
app.use("/api/v1/zindigiWallet", zindigiWalletRouter);
app.use("/api/v1/returnOrder", returnOrderRouter);
app.use("/api/v1/payment", paymentRouter);
app.use("/api/v1/customerCare", customerCareRouter);
app.use("/api/v1/permissionAction", permissionActionRouter);
app.use("/api/v1/module", moduleRouter);
app.use("/api/v1/subModule", subModuleRouter);
app.use("/api/v1/rolePermission", rolePermissionRouter);

// const swaggerSpec = swaggerjsdoc(option);
// app.use(
//   "/api-docs",
//   swaggeruiexpress.serve,
//   swaggeruiexpress.setup(swaggerSpec, { explorer: true })
// );
swaggerDocs(app, port);

//404 Handler
app.get("/", (req, res, next) => {
  res.status(200).send({ msg: "Welcome To M-SAFA " });
});
app.use((req, res, next) => {
  res.status(404).send({ msg: "Route Not found" });
});

//ERROR HANDLER
app.use((err, req, res, next) => {
  console.log(err);
  if (err && err.code === 11000) {
    let errorKey = Object.keys(err["keyPattern"]).toString();
    errorKey = uc.upperCaseFirst(errorKey);
    res.status(400).send({ msg: errorKey + " already exists" });
  }
  if (err.name === "ValidationError") {
    res.status(400).send({
      msg: Object.values(err.errors).map((val) => val.message),
    });
  } else {
    res.status(400).send({ msg: err.message });
  }
});
app.listen(port, () => {
  console.log(`Server is listening on port ${port}...`);
});

console.log(new Date());
//JSZINDIGINEWURL=10.0.6.171 port 7070
//port =7070
