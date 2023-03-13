var projection = {
  __v: false,
  createdAt: false,
  updatedAt: false,
};
var orderprojection = {
  orderId: true,
  placedOn: true,
  status: true,
  totalBill: true,
};

var hometrendprojection = {
  name: 1,
  title: 1,
  discount: 1,
  variant: 1,
  thumbnail: true,
  _id: true,
};
var homecategoryprojection = {
  icon: true,
  name: true,
  _id: true,
};
var homesubcategoryprojection = {
  description: true,
  icon: true,
  name: true,
  _id: true,
};
var webcustomerprojection = {
  password: false,
};
exports.projection = projection;
exports.homecategoryprojection = homecategoryprojection;
exports.homesubcategoryprojection = homesubcategoryprojection;
exports.hometrendprojection = hometrendprojection;
exports.orderprojection = orderprojection;
exports.webcustomerprojection = webcustomerprojection;
