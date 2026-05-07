const fs = require("fs");

const uploadFile = async (files) => {
    try {
        // Check if files is an array
        const filesArray = Array.isArray(files) ? files : [files];

        const uploadedFiles = [];

        for (const file of filesArray) {
            const [, fileType, fileData] = file.match(/^data:(.+);base64,(.+)$/);
            const [fileMainType, fileSubType] = fileType.split("/");
            const fileBuffer = Buffer.from(fileData, "base64");
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
            uploadedFiles.push(filePathPrefix + fileName);
        }

        return uploadedFiles;
    } catch (err) {
        console.log(err);
        return null;
    }
};

module.exports = uploadFile;
