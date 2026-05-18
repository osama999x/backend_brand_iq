const crypto = require("crypto");
fs = require("fs");
util = require("util");
writeFile = util.promisify(fs.writeFile);

/** Parse data URLs without regex on huge base64 payloads (can fail on large images). */
const parseDataUrl = (file) => {
    if (typeof file !== "string" || !file.startsWith("data:")) return null;
    const commaIdx = file.indexOf(",");
    if (commaIdx === -1) return null;
    const header = file.slice(5, commaIdx);
    const base64Marker = ";base64";
    const markerIdx = header.indexOf(base64Marker);
    if (markerIdx === -1) return null;
    return {
        fileType: header.slice(0, markerIdx),
        fileData: file.slice(commaIdx + 1),
    };
};

const uploadFile = async (file) => {
    try {
        const parsed = parseDataUrl(file);
        if (!parsed) return null;
        const { fileType, fileData } = parsed;
        const [fileMainType, fileSubType] = fileType.split("/");
        const fileBuffer = Buffer.from(fileData, "base64");
        const fileName = `${Date.now()}-${crypto.randomBytes(4).toString("hex")}.${fileSubType}`;
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
