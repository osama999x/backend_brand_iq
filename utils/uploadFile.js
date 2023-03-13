fs = require("fs");
util = require("util");
writeFile = util.promisify(fs.writeFile);
const uploadFile = async (file) => {
  try {
    const [, fileType, fileData] = file.match(/^data:(.+);base64,(.+)$/);
    const [fileMainType, fileSubType] = fileType.split("/");
    const fileBuffer = new Buffer.from(fileData, "base64");
    const fileName = Date.now() + "." + fileSubType;
    let filePath = null;
    let filePathPrefix = null;
    if (fileMainType === "image") {
      filePathPrefix = "images/";
      filePath = "public/images/" + fileName;
    } else if (fileMainType === "video") {
      filePathPrefix = "videos/";
      filePath = "public/videos/" + fileName;
    } else {
      filePathPrefix = "files/";
      filePath = "public/files/" + fileName;
    }
    await fs.promises.writeFile(filePath, fileBuffer);
    return filePathPrefix + fileName;
  } catch (err) {
    console.log(err);
    return null;
  }
  //   let base64image = file.split(";base64,").pop();
  //   const filename = Date.now();
  //   await writeFile("./public/images/" + filename + ".png", base64image, {
  //     encoding: "base64",
  //   });
  //   return "images/" + filename + ".png";
};

module.exports = uploadFile;

// const uploadFile = async (file) => {
// try {
//   const [, fileType, fileData] = file.match(/^data:(.+);base64,(.+)$/);
//   const [fileMainType, fileSubType] = fileType.split("/");
//   const fileBuffer = new Buffer.from(fileData, "base64");
//   const fileName = Date.now() + "." + fileSubType;
//   let filePath = null;
//   let filePathPrefix = null;
//   if (fileMainType === "image") {
//     filePathPrefix = "images/";
//     filePath = "public/images/" + fileName;
//   } else if (fileMainType === "video") {
//     filePathPrefix = "videos/";
//     filePath = "public/videos/" + fileName;
//   } else {
//     filePathPrefix = "files/";
//     filePath = "public/files/" + fileName;
//   }
//   await fs.promises.writeFile(filePath, fileBuffer);
//   return filePathPrefix + fileName;
// } catch (err) {
//   console.log(err);
//   return null;
// }
// };

// module.exports = uploadFile;
