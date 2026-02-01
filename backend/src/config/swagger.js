const swaggerJsDoc = require("swagger-jsdoc");

const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "ProgTalk API",
      version: "1.0.0",
      description: "Dokumentacja API ProgTalk",
    },
    servers: [{ url: "https://localhost:3001" }],
  },
  apis: ["./src/docs/*.yaml"],
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);

module.exports = swaggerDocs;
