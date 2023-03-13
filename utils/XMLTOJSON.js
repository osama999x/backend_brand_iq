const { XMLParser } = require("fast-xml-parser");
module.exports = (xml, endpoint) => {
  const options = {
    ignoreAttributes: false,
  };

  const parser = new XMLParser(options);
  let jsonObj = parser.parse(xml);
  return jsonObj["soap:Envelope"]["soap:Body"][endpoint];
};
