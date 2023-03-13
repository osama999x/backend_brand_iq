const { default: axios } = require("axios");

const get = (url) => {};

const post = async (url, data, option) => {
  const res = await axios.post(url, data);
  if (res) {
    return res;
  } else {
    return null;
  }
};

module.exports = { get, post };
