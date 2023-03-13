const customerModel = require("../model/customerModel");
const resetPasswordModel = require("../model/resetPasswordModel");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const projection = require("../config/mongoProjection");
const sendEmail = require("../utils/sendEmail");
const uploadFile = require("../utils/uploadFile");
const pointModel = require("../model/pointModel");
const WebSignupLogModel = require("../model/webSignupLogModel");
const pointManageModel = require("../model/pointManageModel");
const membershipModel = require("../model/membershipModel");
const customerMembershipModel = require("../model/customerMembershipModel");
const membershipBenifitModel = require("../model/membershipBenifitModel");
const readNotficationModel = require("../model/readNotificationModel");
const jwt = require("jsonwebtoken");
const encryptRequest = require("../middleware/encryptRequest");
const pointServices = require("./pointServices");
const saveOtp = require("../utils/saveOtp");
const jwtServices = require("../utils/jwtService");
const { v4: uuidv4 } = require("uuid");
const authIdServices = require("./authIdServices");

const customerServices = {
  validatePassword: async (password, realPassword) => {
    const valid = await bcrypt.compare(password, realPassword);
    return valid;
  },
  login: async (email) => {
    const customer = await customerModel.findOne({ email: email });
    // if (customer) {
    //   // check customer password with hashed password stored in the database
    //   const validPassword = await bcrypt.compare(password, customer.password);
    //   if (validPassword) {
    //     await customerModel.findOneAndUpdate({ email }, { fcmToken: fcmToken });
    //     var result = await customerModel
    //       .findOne(
    //         { email: email },
    //         { createdAt: 0, updatedAt: 0, __v: 0, password: 0 }
    //       )
    //       .lean();
    if (customer) {
      const uuid = uuidv4();
      console.log("uuid", uuid);
      const refreshToken = jwtServices.create({ uuid, type: "user" });
      const token = jwtServices.create(
        { userId: customer._id, type: "user" },
        "5m"
      );
      authIdServices.add(customer._id, uuid);
      await customerModel.findOneAndUpdate(
        { _id: customer._id },
        { token },
        { new: true }
      );

      // jwt.sign(
      //   {
      //     email: result.email,
      //   },
      //   process.env.SECRET_KEY,
      //   {
      //     expiresIn: "5m",
      //   }
      // );

      //  jwt.sign(
      //   { email: result.email },
      //   process.env.SECRET_KEY,
      //   {
      //     expiresIn: "30m",
      //   }
      // );
      // refreshToken = encryptRequest(refreshToken);
      // token = encryptRequest(token);

      customer.token = token;
      customer.refreshToken = refreshToken;
    }
    return customer;
    //   } else {
    //     throw "Incorrect Password";
    //   }
    // } else {
    //   throw "Customer doesn't exists";
    // }
  },
  customerDetails: async (_id) => {
    var _id = mongoose.Types.ObjectId(_id);
    let customer = await customerModel
      .findOne({ _id: _id }, projection.projection)
      .lean();
    if (customer) {
      const uuid = uuidv4();
      console.log("uuid", uuid);
      const refreshToken = jwtServices.create({ uuid, type: "user" });
      const token = jwtServices.create(
        { userId: customer._id, type: "user" },
        "5m"
      );
      authIdServices.add(customer._id, uuid);
      await customerModel.findOneAndUpdate(
        { _id: customer._id },
        { token },
        { new: true }
      );
      //  jwt.sign(
      //   { email: result.email },
      //   process.env.SECRET_KEY,
      //   {
      //     expiresIn: "30m",
      //   }
      // );
      // refreshToken = encryptRequest(refreshToken);
      // token = encryptRequest(token);

      // customer.accessToken = token;
      customer.refreshToken = refreshToken;
    }
    return customer;
  },
  addNew: async (
    firstName,
    lastName,
    email,
    contact,
    address,
    gender,
    password,
    cnic
  ) => {
    const checkCustomer = await customerModel.findOne({ email: email });
    if (checkCustomer) {
      throw new Error("User already exist");
    } else {
      let getInitialPoint = await pointManageModel.find({});
      if (getInitialPoint.length != 0) {
        var initialPoint = getInitialPoint[0].initialPoint;
      } else {
        initialPoint = 0;
      }
      const salt = await bcrypt.genSalt(10);
      password = await bcrypt.hash(password, salt);
      customer = new customerModel({
        firstName,
        lastName,
        email,
        contact,
        address,
        gender,
        password,
        cnic,
        points: initialPoint,
      });
      const result = await customer.save();
      if (result) {
        id = result._id;
        points = result.points;
        await pointServices.assaignPointMembership(id, points);
      }
      return result;
    }
  },
  addNewWeb: async (
    firstName,
    lastName,
    email,
    contact,
    address,
    gender,
    cnic,
    fcmToken
  ) => {
    const user = await customerModel.findOne(
      { email, contact },
      projection.webcustomerprojection
    );
    if (user) {
      await customerModel.findOneAndUpdate(
        { email: email, contact: contact },
        { fcmToken: fcmToken }
      );
      const webCustomer = new WebSignupLogModel({
        customer: mongoose.Types.ObjectId(user._id),
      });
      await webCustomer.save();
      return user;
    } else {
      let getInitialPoint = await pointManageModel.find({});
      if (getInitialPoint.length != 0) {
        var initialPoint = getInitialPoint[0].initialPoint;
      } else {
        getInitialPoint = 0;
      }
      var customer = new customerModel({
        firstName,
        lastName,
        email,
        contact,
        address,
        gender,
        cnic,
        fcmToken,
        points: initialPoint,
      });
      const result = await customer.save();
      const webCustomer = new WebSignupLogModel({
        customer: mongoose.Types.ObjectId(result._id),
      });
      await webCustomer.save();
      if (result) {
        let customerPoints = await customerModel.findById(
          { _id: result._id },
          { points: 1 }
        );
        customerPoints = customerPoints.points;
        var customerId = result._id;
        const membershipCategories = ["Silver", "Gold", "Platinum", "Diamond"];
        for (var category of membershipCategories) {
          //category=category.membershipCategories;
          var currentCategory = await membershipModel.findOne(
            { membershipCategory: { $in: category } },
            { thresholdFrom: 1, thresholdTo: 1, membershipCategory: 1 }
          );
          if (currentCategory) {
            thresholdFrom = currentCategory.thresholdFrom;
            thresholdTo = currentCategory.thresholdTo;
            category = currentCategory.membershipCategory;
            id = currentCategory._id;
            if (
              customerPoints >= thresholdFrom &&
              customerPoints <= thresholdTo
            ) {
              await customerModel.findOneAndUpdate(
                { _id: { $in: customerId } },
                { membershipCategory: category }
              );
              const data = new customerMembershipModel({
                customer: customerId,
                membershipId: id,
                membershipCategory: category,
                customerPoints: customerPoints,
              });
              await data.save();
              break;
            }
          }
        }
        const unRead = new readNotficationModel({
          customer: customerId,
          readNotfication: [],
        });
        await unRead.save();
      }
      return result;
    }
  },
  updateDetails: async (_id, firstName, lastName, contact, address, gender) => {
    result = await customerModel.findOneAndUpdate(
      { _id },
      {
        firstName,
        lastName,
        contact,
        address,
        gender,
      },
      {
        new: true,
      }
    );
    return result;
  },
  uploadProfileImage: async (_id, image) => {
    const result = await customerModel.findOneAndUpdate(
      { _id },
      { image },
      { new: true }
    );
    return result;
  },
  resetPassword: async (email) => {
    const customer = await customerModel.findOne({
      email: email,
    });
    if (customer) {
      result = await sendEmail(email);
      console.log(result);
      return result;
    } else {
      return null;
    }
  },
  verifyNewPassword: async (email, otp) => {
    const expireOtp = await saveOtp.validateOTPExpiryByEmail(email);
    if (expireOtp) {
      const user = await saveOtp.verifiyOtp(email, otp);
      if (!user) {
        throw "OTP not varified!";
      } else {
        const customer = await customerModel.findOneAndUpdate(
          { email },
          { isVarified: true },
          { new: true }
        );
        return customer;
      }
    } else {
      throw "OTP Expire Please Try Again";
    }
  },
  setNewPassword: async (_id, password) => {
    const salt = await bcrypt.genSalt(10);
    password = await bcrypt.hash(password, salt);
    const result = await customerModel.findOneAndUpdate(
      { _id: _id },
      {
        password,
      },
      {
        new: true,
      }
    );
    return result;
  },
  setForgotPassword: async (email, password) => {
    const salt = await bcrypt.genSalt(10);
    password = await bcrypt.hash(password, salt);
    const result = await customerModel.findOneAndUpdate(
      { email: email },
      {
        password,
      },
      {
        new: true,
      }
    );
    return result;
  },
  registerCustomer: async () => {
    let list = await customerModel
      .find(
        {},
        {
          firstName: 1,
          lastName: 1,
          contact: 1,
          email: 1,
          address: 1,
          gender: 1,
        }
      )
      .lean();
    list = list.map((item) => {
      const whiteSpace = " ";
      item.customerName = item.firstName.concat(whiteSpace, item.lastName);
      delete item.firstName;
      delete item.lastName;
      return item;
    });
    return list;
  },
  registerCustomerDetails: async (_id) => {
    let result = await customerModel
      .findById(
        { _id },
        {
          firstName: 1,
          lastName: 1,
          contact: 1,
          email: 1,
          address: 1,
          gender: 1,
        }
      )
      .lean();
    const whiteSpace = " ";
    result.customerName = result.firstName.concat(whiteSpace, result.lastName);
    delete result.firstName;
    delete result.lastName;
    return result;
  },
  customerMembership: async (customerId) => {
    let result = await customerMembershipModel
      .findOne(
        { customer: { $in: customerId } },
        {
          customer: 1,
          membershipCategory: 1,
          date: 1,
          customerPoints: 1,
          membershipId: 1,
        }
      )
      .limit(1)
      .sort({ $natural: -1 })
      .lean();
    if (result) {
      membershipId = result.membershipId;
      let date = new Date(result.date);
      customerPoints = result.customerPoints;
      category = result.membershipCategory;
      var neaxtDate = date.setDate(date.getDate() + 15);
      var expireDate = date.setDate(date.getDate() + 15);
      const membershipCategories = ["Silver", "Gold", "Platinum", "Diamond"];
      var currentDate = new Date();
      var days = neaxtDate - currentDate;
      days = new Date(days).getDay();
      if (days <= 0) {
        await customerModel.findOneAndUpdate(
          { _id: customerId },
          {
            $inc: { points: -150 },
          }
        );
      }
      neaxtDate = new Date(neaxtDate).toDateString().toLocaleString();
      expireDate = new Date(expireDate).toDateString().toLocaleString();
      if (category === "Diamond") {
        result.msg = "";
        result.expire_msg = ` 150 points will expire on ${expireDate}`;
        delete result._id;
        delete result.date;
      } else {
        for (var i = 0; i < membershipCategories.length; i++) {
          if (membershipCategories[i] === category) {
            var nextCategory = membershipCategories[i + 1];
            const point = await membershipModel.findOne(
              { membershipCategory: nextCategory },
              { thresholdFrom: 1 }
            );
            if (point) {
              var nextCategoryPoint = point.thresholdFrom;
            }
            break;
          }
        }

        result.msg = `Complete ${nextCategoryPoint} to acheive ${nextCategory} category till ${neaxtDate}`;
        result.expire_msg = `150 points will expire on ${expireDate}`;
        result.nextCategoryPoint = nextCategoryPoint;
        delete result._id;
        delete result.date;
      }
      // membershipId = membershipId.toLocaleString();
      // console.log(membershipId);
      var currentDate = new Date().toLocaleDateString();
      currentDate = new Date(currentDate);

      const benifits = await membershipBenifitModel.find(
        {
          $and: [
            {
              membershipCategory: membershipId,
              expireDate: { $gte: currentDate },
            },
          ],
        },
        projection.projection
      );
      result.benifits = benifits;
      // return result;
    }
    return result;
  },
  addZindigiAccount: async (_id, mobileNo, accountTitle) => {
    const customer = await customerModel.findOneAndUpdate(
      { _id },
      {
        zindigiWallet: {
          zindigiWalletNumber: mobileNo,
          title: accountTitle,
          linked: true,
        },
      },
      { new: true }
    );
    if (customer) {
      return true;
    } else {
      return false;
    }
  },
  getUser: async (userId) => {
    const result = await customerModel.findById({ _id: userId });
    return result;
  },
  deLinkZindigiAccount: async (email) => {
    const result = await customerModel
      .findOneAndUpdate(
        { email },
        {
          zindigiWallet: {
            zindigiWalletNumber: "",
            linked: false,
            title: "",
          },
        },
        { new: true }
      )
      .lean();
    return result;
  },
};

module.exports = customerServices;
