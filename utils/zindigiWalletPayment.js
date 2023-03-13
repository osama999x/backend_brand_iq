const permissionModel = require("../model/permissionModel");
const axios = require("axios");
const mongoose = require("mongoose");
const projection = require("../config/mongoProjection");
const convertDate = require("../utils/convertDate");
const zindigiAccessTokens = require("../utils/zindigiAccessTokens");
const zindigiEncryption = require("../utils/zindigiEncryption");
const zindigiLogServices = require("../services/zindigiLogServices");

const { createHash } = require("crypto");
const XMLTOJSON = require("../utils/XMLTOJSON");
let zindigiTraceNo = 100222;
const zindigiWalletPayment = {
  verifyAcountToLink: async (cnic, mobileNo, dateTime) => {
    console.log("mobile", mobileNo);
    let traceNo = Math.floor(Math.random() * 1000000000000 + 1000000000000);
    let body = {
      cnic,
      dateTime,
      mobile: mobileNo,
      userName: "ApiGee@JS",
      password: "ApiGee@JS",
      rrn: traceNo,
      transactionType: "02",
      channelId: "ECOMM",
      r1: "02",
      r2: "01",
    };
    const hash = createHash("sha256")
      .update(
        body.userName +
          body.password +
          body.cnic +
          body.dateTime +
          body.mobile +
          body.rrn +
          body.transactionType +
          body.channelId +
          body.r1 +
          body.r2
      )
      .digest("Hex");
    let zindigiLog;
    try {
      zindigiLog = await zindigiLogServices.new("verifyAccountRequest", {
        ...body,
        hash,
      });
    } catch (e) {
      console.log(e);
    }
    let xml = `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:tem="http://tempuri.org/">   <soapenv:Header/>   <soapenv:Body>      <tem:verifyAccountRequest>         
             <UserName>${body.userName}</UserName>         
             <Password>${body.password}</Password>         
             <Cnic>${body.cnic}</Cnic>         
             <DateTime>${body.dateTime}</DateTime>         
             <MobileNumber>${body.mobile}</MobileNumber>         
             <Rrn>${body.rrn}</Rrn>         
             <TransactionType>${body.transactionType}</TransactionType>         
             <ChannelId>${body.channelId}</ChannelId>         
             <Reserved1>${body.r1}</Reserved1>         
             <Reserved2>${body.r2}</Reserved2>         
             <Reserved3></Reserved3>         
             <Reserved4></Reserved4>         
             <Reserved5></Reserved5>         
             <HashData>${hash}</HashData>      </tem:verifyAccountRequest>   </soapenv:Body></soapenv:Envelope>`;
    const response = await axios.post(
      `${process.env.JSZINDIGINEWURL}/js-blb-integration/JsBLBIntegration`,
      xml,
      {
        headers: {
          "Content-Type": "text/xml",
        },
      }
    );
    console.log("reponse", response);
    console.log(XMLTOJSON(response.data, "ns2:verifyAccountResponse"));
    if (response.status === 200) {
      const jsontData = XMLTOJSON(response.data, "ns2:verifyAccountResponse");
      try {
        zindigiLogServices.updateResponse(zindigiLog._id, jsontData);
      } catch (err) {
        console.log(err);
      }
      return jsontData;
    }
    return null;
  },
  linkAccount: async (cnic, mobileNo, dateTime, mPin) => {
    console.log("mpin", mPin);
    let traceNo = Math.floor(Math.random() * 1000000000000 + 1000000000000);
    mPin = zindigiEncryption(Number(mPin));
    const body = {
      userName: "ApiGee@JS",
      password: "ApiGee@JS",
      transactionType: "01",
      MobileNumber: mobileNo,
      cnic,
      dateTime,
      rrn: traceNo,
      channelId: "ECOMM",
      mPin,
      r1: "03",
    };
    let hash = createHash("sha256")
      .update(
        body.userName +
          body.password +
          body.transactionType +
          body.MobileNumber +
          body.cnic +
          body.dateTime +
          body.rrn +
          body.channelId +
          body.mPin +
          body.r1
      )
      .digest("hex");
    let zindigiLog;
    try {
      zindigiLog = zindigiLogServices.new("accountLinkDeLink", {
        ...body,
        hash,
      });
    } catch (e) {
      console.log(e);
    }
    const xml = `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:tem="http://tempuri.org/">   
    <soapenv:Header/>   
    <soapenv:Body>      
    <tem:accountLinkDeLink>         
             <UserName>${body.userName}</UserName>         
             <Password>${body.password}</Password>         
             <transactionType>${body.transactionType}</transactionType>         
             <MobileNumber>${body.MobileNumber}</MobileNumber>         
             <Cnic>${body.cnic}</Cnic>         
             <DateTime>${body.dateTime}</DateTime>         
             <Rrn>${body.rrn}</Rrn>         
             <ChannelId>${body.channelId}</ChannelId>         
             <MPIN>${body.mPin}</MPIN>         
             <Reserved1>${body.r1}</Reserved1>         
             <Otp></Otp>         
             <Reserved2></Reserved2>         
             <Reserved3></Reserved3>         
             <Reserved4></Reserved4>         
             <Reserved5></Reserved5>         
             <HashData>${hash}</HashData>      
      </tem:accountLinkDeLink>  
      </soapenv:Body>
      </soapenv:Envelope>`;
    const response = await axios.post(
      `${process.env.JSZINDIGINEWURL}/js-blb-integration/JsBLBIntegration`,
      xml,
      {
        headers: {
          Content: "text/xml",
        },
      }
    );
    console.log(XMLTOJSON(response.data));
    if (response.status === 200) {
      let jsonData = XMLTOJSON(response.data, "ns2:accountLinkDeLinkResponse");
      try {
        zindigiLogServices.updateResponse(zindigiLog._id, jsonData);
      } catch (e) {
        console.log(e);
      }
      console.log("jsonData", jsonData);
      return jsonData;
    }
    return null;
  },
  payment: async (dateTime, mobileNo, amount) => {
    console.log("amount", amount);
    // if (traceNo < 999999999999) {
    //   traceNo++;
    // } else {
    //   traceNo = 100000000000;
    // }
    let traceNo = Math.floor(Math.random() * 1000000000000 + 1000000000000);
    // dateTime = convertDate(new Date());
    console.log("dateTime", dateTime);
    // otpPin = zindigiEncryption(Number(otpPin));
    let data = {
      userName: "ApiGee@JS",
      password: "ApiGee@JS",
      mobileNo,
      dateTime,
      rrn: traceNo,
      transactionAmount: amount,
      channelId: "ECOMM",
      terminalId: "ECOMM",
      productId: "10245387",
      pinType: "01",
    };
    console.log("data", data);
    const hash = createHash("sha256")
      .update(
        data.userName +
          data.password +
          data.mobileNo +
          data.dateTime +
          data.rrn +
          data.channelId +
          data.terminalId +
          data.productId +
          data.pinType +
          data.transactionAmount
      )
      .digest("hex");
    console.log("hash", hash);
    let zindigiLog;
    try {
      zindigiLog = await zindigiLogServices.new("DebitRequest", data);
    } catch (err) {
      console.log(err);
    }
    const xml = `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:tem="http://tempuri.org/">
   <soapenv:Header/>
   <soapenv:Body>
      <tem:DebitRequest>
         <UserName>${data.userName}</UserName>
         <Password>${data.password}</Password>
         <MobileNumber>${data.mobileNo}</MobileNumber>
         <DateTime>${data.dateTime}</DateTime>
         <Rrn>${data.rrn}</Rrn>
         <ChannelId>${data.channelId}</ChannelId>
         <TerminalId>${data.terminalId}</TerminalId>
         <ProductId>${data.productId}</ProductId>
         <PinType>${data.pinType}</PinType>
         <TransactionAmount>${data.transactionAmount}</TransactionAmount>
         <PIN></PIN>
         <Reserved1></Reserved1>
         <Reserved2></Reserved2>
         <Reserved3></Reserved3>
         <Reserved4></Reserved4>
         <Reserved5></Reserved5>
         <Reserved6></Reserved6>
         <Reserved7></Reserved7>
         <Reserved8></Reserved8>
         <Reserved9></Reserved9>
         <Reserved10></Reserved10>
         <HashData>${hash}</HashData>
      </tem:DebitRequest>
   </soapenv:Body>
</soapenv:Envelope>`;
    console.log("xml", xml);
    const response = await axios.post(
      `${process.env.JSZINDIGINEWURL}/js-blb-integration/JsBLBIntegration`,
      xml,
      {
        headers: {
          Content: "text/xml",
        },
      }
    );
    console.log("response", response.data);
    if (response.status === 200) {
      const jsonData = XMLTOJSON(response.data, "ns2:debitResponse");
      try {
        zindigiLogServices.updateResponse(zindigiLog._id, jsonData);
      } catch (err) {
        console.log(err);
      }
      console.log("jsonData", jsonData);
      return jsonData;
    }
    return null;
  },
  paymentInquiry: async (mobileNo, amount, dateTime) => {
    let traceNo = Math.floor(Math.random() * 1000000000000 + 1000000000000);
    let body = {
      userName: "ApiGee@JS",
      password: "ApiGee@JS",
      mobileNo,
      dateTime,
      rrn: traceNo,
      channelId: "ECOMM",
      terminalId: "ECOMM",
      productId: "10245387",
      pinType: "01",
      transactionAmount: amount,
    };
    let hash = createHash("sha256")
      .update(
        body.userName +
          body.password +
          body.mobileNo +
          body.dateTime +
          body.rrn +
          body.channelId +
          body.terminalId +
          body.productId +
          body.pinType +
          body.transactionAmount
      )
      .digest("hex");
    let zindigiLog;
    try {
      zindigiLog = await zindigiLogServices.new(
        "DebitInquiryRequest",
        body,
        hash
      );
    } catch (err) {
      console.log(err);
    }
    let xml = `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:tem="http://tempuri.org/">   <soapenv:Header/>   <soapenv:Body>      <tem:DebitInquiryRequest>         
             <UserName>${body.userName}</UserName>         
             <Password>${body.password}</Password>         
             <MobileNumber>${body.mobileNo}</MobileNumber>         
             <DateTime>${body.dateTime}</DateTime>         
             <Rrn>${body.rrn}</Rrn>         
             <ChannelId>${body.channelId}</ChannelId>         
             <TerminalId>${body.terminalId}</TerminalId>         
             <ProductId>${body.productId}</ProductId>         
             <PinType>${body.pinType}</PinType>         
             <TransactionAmount>${body.transactionAmount}</TransactionAmount>         
             <Reserved1></Reserved1>         
             <Reserved2></Reserved2>         
             <Reserved3></Reserved3>         
             <Reserved4></Reserved4>         
             <Reserved5></Reserved5>         
             <Reserved6></Reserved6>         
             <Reserved7></Reserved7>         
             <Reserved8></Reserved8>         
             <Reserved9></Reserved9>         
             <Reserved10></Reserved10>         
             <HashData>${hash}</HashData>      </tem:DebitInquiryRequest>   </soapenv:Body></soapenv:Envelope>`;
    const response = await axios.post(
      `${process.env.JSZINDIGINEWURL}/js-blb-integration/JsBLBIntegration`,
      xml,
      {
        headers: {
          "Content-Type": "text/xml",
        },
      }
    );
    console.log(XMLTOJSON(response.data, "ns2:debitInquiryResponse"));
    console.log("response", response);
    if (response.status === 200) {
      let jsonData = XMLTOJSON(response.data, "ns2:debitInquiryResponse");
      console.log("jsonData", jsonData);
      try {
        zindigiLogServices.updateResponse(zindigiLog._id, jsonData);
      } catch (e) {
        console.log(e);
      }
      return jsonData;
    }
    return null;
  },
  balanceInquiry: async (mobileNo, dateTime) => {
    let traceNo = Math.floor(Math.random() * 1000000000000 + 1000000000000);
    // if (traceNo < 999999) {
    //   traceNo++;
    // } else {
    //   traceNo = 100000;
    // }
    const body = {
      userName: "ApiGee@JS",
      password: "ApiGee@JS",
      mobileNo,
      dateTime,
      rrn: traceNo,
      channelId: "ECOMM",
      terminalId: "ECOMM",
      r1: "01",
    };
    const hash = createHash("sha256")
      .update(
        body.userName +
          body.password +
          body.mobileNo +
          body.dateTime +
          body.rrn +
          body.channelId +
          body.terminalId +
          body.r1
      )
      .digest("hex");
    let zindigiLog;
    try {
      zindigiLog = zindigiLogServices.new("BalanceInqueryRequest", body, hash);
    } catch (e) {
      console.log(e);
    }
    const xml = `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:tem="http://tempuri.org/">   <soapenv:Header/>   <soapenv:Body>      <tem:balanceInquiryRequest>         
             <UserName>${body.userName}</UserName>         
             <Password>${body.password}</Password>         
             <Mpin></Mpin>         
             <MobileNumber>${body.mobileNo}</MobileNumber>         
             <DateTime>${body.dateTime}</DateTime>         
             <Rrn>${body.rrn}</Rrn>         
             <ChannelId>${body.channelId}</ChannelId>         
             <TerminalId>${body.terminalId}</TerminalId>         
             <OtpPin></OtpPin>         
             <Reserved1>${body.r1}</Reserved1>         
             <Reserved2></Reserved2>         
             <Reserved3></Reserved3>         
             <Reserved4></Reserved4>         
             <Reserved5></Reserved5>         
             <HashData>${hash}</HashData>      </tem:balanceInquiryRequest>   </soapenv:Body></soapenv:Envelope>`;
    const response = await axios.post(
      `${process.env.JSZINDIGINEWURL}/js-blb-integration/JsBLBIntegration`,
      xml,
      {
        headers: {
          "Content-Type": "text/xml",
        },
      }
    );
    console.log("xml", xml);
    console.log("reponse", response.data);
    console.log(
      "json is",
      XMLTOJSON(response.data, "ns2:balanceInquiryResponse")
    );
    if (response.status === 200) {
      const jsonData = XMLTOJSON(response.data, "ns2:balanceInquiryResponse");
      try {
        zindigiLogServices.updateResponse(zindigiLog._id, jsonData);
      } catch (e) {
        console.log(e);
      }
      return jsonData;
    }
    return null;
  },
};
module.exports = zindigiWalletPayment;
