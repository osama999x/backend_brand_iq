module.exports = (cnic) => {
  const arr = cnic.split("-");
  return arr[0] + arr[1] + arr[2];
};
