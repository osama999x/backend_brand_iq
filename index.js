const express = require("express");
const limiter = require("./middleware/iplimitMiddleware");
const decryptData = require("./middleware/decryptRequest");
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
const promotionRouter = require("./routes/promotionRouter");
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
const mPromotionRouter = require("./routes/mPromotionRouter");
const orderStatusRouter = require("./routes/orderStatusRouter");
const addToCartRouter = require("./routes/addToCartRouter");
const pointRouter = require("./routes/pointRouter");
const webSignupLogRouter = require("./routes/webSignupLogRouter");
const pointManageRouter = require("./routes/pointManageRouter");
const bannerRouter = require("./routes/bannerRouter");
const notificatinoRouter = require("./routes/notificationRouter");
const membershipBenifitRouter = require("./routes/membershipBenifitRouter");
const dealsProductRouter = require("./routes/dealsProductRouter");
const couponPolicyRouter = require("./routes/couponPolicyRouter");
const tokenRouter = require("./routes/tokenRouter");

require("./db/index");
const port = process.env.PORT;

app.use(express.json({ limit: "50mb" }));
app.use(express.static("public"));
app.use(express.static(path.join(__dirname, "public")));
//app.use(decryptData);//Cipher
//app.use(limiter); //Limit IP Requests
app.use(morgan("dev"));

var corOptions = {
  origin: "*",
};
app.use(cors(corOptions));
//test Router

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
app.use("/api/v1/promotion", promotionRouter);
app.use("/api/v1/mPromotion", mPromotionRouter);
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
app.use("/api/v1/notificaion", notificatinoRouter);
app.use("/api/v1/membershipBenifit", membershipBenifitRouter);
app.use("/api/v1/dealsProduct", dealsProductRouter);
app.use("/api/v1/token", tokenRouter);

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
    res
      .status(400)
      .send({ msg: Object.values(err.errors).map((val) => val.message) });
  } else {
    res.status(400).send({ msg: err.message });
  }
});
app.listen(port, () => {
  console.log(`Server is listening on port ${port}...`);
});

console.log(new Date());
