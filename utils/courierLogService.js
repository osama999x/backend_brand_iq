const courierLogsModel = require("../model/courierLogsModel");

const courierLogService = {
  new: async (path, request) => {
    const result = await courierLogsModel.create({ path, request });
    return result;
  },
  updateResponse: async (_id, response) => {
    const result = await courierLogsModel.findOneAndUpdate(
      { _id },
      { response },
      { new: true }
    );
    return result;
  },
};
module.exports = courierLogService;
