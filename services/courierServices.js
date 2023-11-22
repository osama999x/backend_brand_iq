const { default: axios } = require("axios");
const operationalCityModel = require("../model/operationalCityModel");
const warehouseModel = require("../model/warehouseModel");
const courierAccessToken = require("../utils/courierAccessToken");
const courierLogService = require("../utils/courierLogService");
const CircularJSON = require("circular-json");

const courierServices = {
  orderTrack: async (parcelId) => {
    console.log(parcelId);
    let courierLog;
    try {
      courierLog = await courierLogService.new(
        "api/v1/courier/postEx/orderTrack"
      );
    } catch (error) {
      console.log(error);
    }
    const token = courierAccessToken.postExToken;
    const data = await axios.get(
      `https://api.postex.pk/services/integration/api/order/v1/track-order/${parcelId}`,
      {
        headers: {
          token,
        },
      }
    );
    try {
      courierLogService.updateResponse(courierLog._id, data.data);
    } catch (error) {
      console.log(error);
    }
    return data.data;
  },
  orderStatus: async () => {
    let courierLog;
    try {
      courierLog = await courierLogService.new(
        "api/v1/courier/postEx/orderStatus"
      );
    } catch (error) {
      console.log(error);
    }
    const token = courierAccessToken.postExToken;
    const data = await axios.get(
      `https://api.postex.pk/services/integration/api/order/v1/get-order-status`,
      {
        headers: {
          token,
        },
      }
    );
    try {
      courierLogService.updateResponse(courierLog._id, data.data);
    } catch (error) {
      console.log(error);
    }
    return data.data;
  },
  citiesList: async () => {
    let courierLog;
    try {
      courierLog = await courierLogService.new(
        "api/v1/courier/postEx/operationalCities"
      );
    } catch (error) {
      console.log(error);
    }
    const token = courierAccessToken.postExToken;
    const data = await axios.get(
      "https://api.postex.pk/services/integration/api/order/v2/get-operational-city",
      {
        headers: {
          token: token,
        },
      }
    );
    const citiesCount = await operationalCityModel.findOne({
      courier: "postEx",
    });
    if (data && !citiesCount) {
      const addOperationalCities = new operationalCityModel({
        operationalCities: data.data.dist,
        courier: "postEx",
      });
      await addOperationalCities.save();
    }
    try {
      courierLogService.updateResponse(courierLog._id, data.data);
    } catch (error) {
      console.log(error);
    }
    return data.data;
  },
  cancelOrder: async (parcelId) => {
    const body = {
      trackingNumber: parcelId,
    };
    let courierLog;
    try {
      courierLog = await courierLogService.new(
        "api/v1/courier/postEx/operationalCities"
      );
    } catch (error) {
      console.log(error);
    }
    const token = courierAccessToken.postExToken;
    const data = await axios.put(
      "https://api.postex.pk/services/integration/api/order/v1/cancel-order",
      body,
      {
        headers: {
          "Content-Type": "application/json",
          token,
        },
      }
    );
    try {
      courierLogService.updateResponse(courierLog._id, data.data);
    } catch (error) {
      console.log(error);
    }
    return data.data;
  },
  warehouse: async () => {
    let courierLog;
    const citiesCount = await warehouseModel.findOne({}, { warehouses: 1 });
    if (!citiesCount) {
      try {
        courierLog = await courierLogService.new(
          "api/v1/courier/postEx/warehouse"
        );
        const token = courierAccessToken.postExToken;
        const data = await axios.get(
          "https://api.postex.pk/services/integration/api/order/v1/get-merchant-address",
          {
            headers: {
              token: token,
            },
          }
        );
        if (data) {
          const addOperationalCities = new warehouseModel({
            warehouses: data.data.dist,
          });
          await addOperationalCities.save();
        }
        try {
          courierLogService.updateResponse(courierLog._id, data.data);
        } catch (error) {
          console.log(error);
        }
        console.log(data);
        return data.data;
      } catch (error) {
        console.log(error);
        throw new Error(error);
      }
    } else {
      return {
        statusCode: "200",
        statusMessage: "SUCCESSFULLY OPERATED",
        dist: citiesCount.warehouses,
      };
    }
  },
  createOrder: async (order, pickupAddressCode, orderType) => {
    var totalQuantity = order.product.reduce(
      (acc, cur) => acc + cur.quantity,
      0
    );
    const body = {
      cityName: order.city,
      customerName: order.customer.firstName + " " + order.customer.lastName,
      customerPhone: order.contact.toString(),
      deliveryAddress: order.customer.email,
      invoiceDivision: 0,
      invoicePayment: order.totalBill,
      items: totalQuantity,
      orderRefNumber: order._id,
      orderType,
      pickupAddressCode,
    };
    console.log(body);
    const token = courierAccessToken.postExToken;
    let courierLog;
    try {
      courierLog = await courierLogService.new(
        "/api/v1/courier/postEx/createOrder",
        body
      );
    } catch (error) {
      console.log(error);
      //  throw new Error(error);
    }

    const data = await axios.post(
      "https://api.postex.pk/services/integration/api/order/v2/create-order",
      body,
      {
        headers: {
          "Content-Type": "application/json",
          token,
        },
      }
    );
    try {
      await courierLogService.updateResponse(courierLog._id, data.data);
    } catch (error) {
      console.log(error);
    }
    console.log(data.data);
    return data.data;
  },
  swyftCreateOrder: async (
    order,
    ORIGIN_CITY,
    packing,
    description,
    weight
  ) => {
    var totalQuantity = order.product.reduce(
      (acc, cur) => acc + cur.quantity,
      0
    );
    let method;
    method =
      order.paymentMethod === "cod" ? (method = "COD") : (method = "NONCOD");
    const body = [
      {
        ORDER_ID: order._id,
        ORDER_TYPE: method,
        CONSIGNEE_FIRST_NAME:
          order.customer.firstName + " " + order.customer.lastName,
        CONSIGNEE_PHONE: "0" + order.contact,
        CONSIGNEE_CITY: order.city,
        CONSIGNEE_ADDRESS: order.address,
        PACKAGING: packing,
        ORIGIN_CITY,
        PIECES: totalQuantity,
        COD: order.totalBill,
        DESCRIPTION: description,
        WEIGHT: weight,
        SHIPPER_ADDRESS_ID: process.env.SWYFTSHIPPERID,
      },
    ];
    console.log(body);
    const token = courierAccessToken.swyftKey;
    let courierLog;
    try {
      courierLog = await courierLogService.new(
        "/api/v1/courier/swyft/createOrder",
        body
      );
    } catch (error) {
      console.log(error);
      throw error;
    }
    console.log(process.env.SWYFTVENDORID);
    const data = await axios.post(
      `https://gateway-prod.swyftlogistics.com/vendor/api/${process.env.SWYFTVENDORID}/api-upload`,
      JSON.stringify(body),
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
        },
      }
    );
    console.log("respose", data.response);
    try {
      await courierLogService.updateResponse(courierLog._id, data.data);
    } catch (error) {
      console.log(error);
    }
    return data;
  },
  swyftOrderTrack: async (parcelId) => {
    console.log(parcelId);
    let courierLog;
    try {
      courierLog = await courierLogService.new(
        "api/v1/courier/swyft/orderTrack"
      );
    } catch (error) {
      console.log(error);
    }
    const token = courierAccessToken.swyftKey;
    const data = await axios.get(
      `https://gateway-prod.swyftlogistics.com/vendor/api/${process.env.SWYFTVENDORID}/get-parcel-history/${parcelId}`,
      {
        headers: {
          Authorization: token,
        },
      }
    );
    try {
      courierLogService.updateResponse(courierLog._id, data.data);
    } catch (error) {
      console.log(error);
    }
    console.log("parcel history", data.data);
    return data;
  },
  swyftCancelOrder: async (parcelId) => {
    const body = {
      parcelId,
    };
    console.log(parcelId);
    let courierLog;
    try {
      courierLog = await courierLogService.new(
        "api/v1/courier/swyft/cancelOrder"
      );
    } catch (error) {
      console.log(error);
    }
    const token = courierAccessToken.swyftKey;
    const data = await axios.post(
      `https://gateway-prod.swyftlogistics.com/vendor/api/${process.env.SWYFTVENDORID}/cancel-parcel/${parcelId}`,
      body,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
        },
      }
    );
    console.log(data.error);
    try {
      courierLogService.updateResponse(courierLog._id, data.data);
    } catch (error) {
      console.log(error);
    }
    return data;
  },
  swyftOperationalCities: async () => {
    let courierLog;
    const citiesCount = await operationalCityModel.findOne(
      {
        courier: "swyft",
      },
      { operationalCities: 1 }
    );
    if (!citiesCount) {
      try {
        courierLog = await courierLogService.new(
          "api/v1/courier/swyft/operationalCities"
        );
      } catch (error) {
        console.log(error);
      }
      const token = courierAccessToken.swyftKey;
      console.log(token);
      const data = await axios.get(
        `https://gateway-prod.swyftlogistics.com/vendor/api/${process.env.SWYFTVENDORID}/get-all-cities`,
        {
          headers: {
            Authorization: token,
          },
        }
      );
      console.log(data);
      if (data) {
        const addOperationalCities = new operationalCityModel({
          operationalCities: data.data,
          courier: "swyft",
        });
        await addOperationalCities.save();
      }
      try {
        courierLogService.updateResponse(courierLog._id, data.data);
      } catch (error) {
        console.log(error);
      }
      return data;
    } else {
      return { status: 200, data: citiesCount.operationalCities };
    }
  },
  trackOrder: async (order) => {
    const traceOrder =
      order.courierType === "POSTEX"
        ? await courierServices.orderTrack(order.trackingId)
        : await courierServices.swyftOrderTrack(order.trackingId);
    return traceOrder;
  },
};
module.exports = courierServices;
