// server/swagger.js
const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Pet Care API",
      version: "1.0.0",
      description: "API documentation for Pet Care application",
    },
    servers: [
      {
        url: "https://mypetcare.onrender.com", 
        
      },
    ],
  },
  apis: ["./router/*.js"],
};

const specs = swaggerJsdoc(options);

module.exports = (app) => {
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs));
};
