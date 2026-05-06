const swaggerJSDoc = require("swagger-jsdoc");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "E-Commerce REST API",
      version: "1.0.0",
      description:
        "REST API documentation for the e-commerce exercise using Express, MongoDB, JWT, Swagger, and Zod.",
    },
    servers: [
      {
        url: "http://localhost:5000",
        description: "Local development server",
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
      schemas: {
        ErrorResponse: {
          type: "object",
          properties: {
            status: { type: "string", example: "error" },
            message: { type: "string", example: "Validation failed" },
            errors: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  field: { type: "string", example: "email" },
                  message: { type: "string", example: "Invalid email address" },
                },
              },
            },
          },
        },
        User: {
          type: "object",
          properties: {
            _id: { type: "string", example: "6658ca5ffbd0af6d9bf2f111" },
            name: { type: "string", example: "Alice" },
            email: { type: "string", example: "alice@example.com" },
            role: { type: "string", example: "user" },
          },
        },
        AuthPayload: {
          type: "object",
          properties: {
            status: { type: "string", example: "success" },
            message: { type: "string", example: "Login successful" },
            token: { type: "string", example: "eyJhbGciOi..." },
            data: {
              type: "object",
              properties: {
                user: { $ref: "#/components/schemas/User" },
              },
            },
          },
        },
        Category: {
          type: "object",
          properties: {
            _id: { type: "string" },
            name: { type: "string", example: "Electronics" },
            slug: { type: "string", example: "electronics" },
            description: {
              type: "string",
              example: "Devices, gadgets, and accessories",
            },
          },
        },
        Product: {
          type: "object",
          properties: {
            _id: { type: "string" },
            name: { type: "string", example: "Mechanical Keyboard" },
            slug: { type: "string", example: "mechanical-keyboard" },
            description: { type: "string" },
            price: { type: "number", example: 89.99 },
            stock: { type: "integer", example: 20 },
            images: {
              type: "array",
              items: { type: "string", example: "https://example.com/image.jpg" },
            },
            rating: { type: "number", example: 4.5 },
            numReviews: { type: "integer", example: 12 },
            category: { $ref: "#/components/schemas/Category" },
          },
        },
        CartItem: {
          type: "object",
          properties: {
            product: { $ref: "#/components/schemas/Product" },
            quantity: { type: "integer", example: 2 },
            price: { type: "number", example: 89.99 },
          },
        },
        Cart: {
          type: "object",
          properties: {
            _id: { type: "string" },
            user: { type: "string" },
            items: {
              type: "array",
              items: { $ref: "#/components/schemas/CartItem" },
            },
            totalItems: { type: "integer", example: 4 },
            totalAmount: { type: "number", example: 179.98 },
          },
        },
        OrderItem: {
          type: "object",
          properties: {
            product: { type: "string" },
            name: { type: "string", example: "Mechanical Keyboard" },
            price: { type: "number", example: 89.99 },
            quantity: { type: "integer", example: 2 },
          },
        },
        Order: {
          type: "object",
          properties: {
            _id: { type: "string" },
            user: { type: "string" },
            items: {
              type: "array",
              items: { $ref: "#/components/schemas/OrderItem" },
            },
            totalAmount: { type: "number", example: 179.98 },
            status: {
              type: "string",
              enum: ["pending", "processing", "shipped", "delivered"],
            },
          },
        },
        Review: {
          type: "object",
          properties: {
            _id: { type: "string" },
            user: { $ref: "#/components/schemas/User" },
            product: { type: "string" },
            rating: { type: "integer", example: 5 },
            comment: { type: "string", example: "Excellent product" },
          },
        },
      },
    },
  },
  apis: ["./src/routes/*.js"],
};

const swaggerSpec = swaggerJSDoc(options);

module.exports = swaggerSpec;
