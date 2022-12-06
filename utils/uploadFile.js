fs = require("fs");
util = require("util");
writeFile = util.promisify(fs.writeFile);
const uploadFile = async (file) => {
  let base64image = file.split(";base64,").pop();
  const filename = Date.now();
  await writeFile("./public/images/" + filename + ".png", base64image, {
    encoding: "base64",
  });
  return "images/" + filename + ".png";
};

module.exports = uploadFile;
