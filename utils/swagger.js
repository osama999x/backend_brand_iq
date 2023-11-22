const { Express, Request, Response } = require("express");
const logger = require("../config/logger");
const swaggerjsdoc = require("swagger-jsdoc");
const swaggeruiexpress = require("swagger-ui-express");
// const swaggerUiOption = {
//   explorer: true,
//   swaggerOptions: {
//     docExpansion: "list",
//   },
// };
const fs = require("fs");
const path = require("path");
const authentication = require("../middleware/authentication.js");
const LOCAL_URL = "local";
const LIVE_URL = "live";
const QA_URL = "qa";
const ZINDIGI_URL = "zindigi";
const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      version: "1.0.0",
      title: "MSAFA APIs Document",
    },
    servers: [
      {
        description: "LOCAL_URL ",
        url: process.env.LOCALURL,
      },
      {
        description: "LIVE_URL",
        url: process.env.BASEURL,
      },
      {
        description: "QA_URL",
        url: process.env.QAURL,
      },
      {
        description: "ZINDIGI_URL",
        url: process.env.QAZINDIGOURL,
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ["./swaggerRoutes/*.yml"],
};
const swaggerSpec = swaggerjsdoc(options);
function swaggerDocs(app, port) {
  // Swagger page
  app.use(
    "/api-docs",
    swaggeruiexpress.serve,
    swaggeruiexpress.setup(swaggerSpec)
  );

  // Docs in JSON format
  app.get("/docs.json", authentication, (req, res) => {
    res.setHeader("Content-Type", "application/json");
    res.send(swaggerSpec);
  });
 // logger.info(`Docs available at http://localhost:${port}/docs`);
}
module.exports = swaggerDocs;
