const swaggerUi = require("swagger-ui-express");
const swaggerJsdoc = require("swagger-jsdoc");

const options = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "API de Albaranes",
            version: "1.0.0",
            description: "Documentación de la API para gestión de albaranes, clientes, proyectos y usuarios.",
        },
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
    apis: ["./routes/*.js"], // 👈 Esto apunta a todas tus rutas
};

const swaggerSpec = swaggerJsdoc(options);

function swaggerDocs(app) {
    app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
    console.log(`📄 Swagger docs disponibles en http://localhost:${process.env.PORT || 3000}/api-docs`);
}

module.exports = swaggerDocs;
