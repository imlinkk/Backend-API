const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const swaggerUi = require("swagger-ui-express");
const routes = require("./routes");
const swaggerSpec = require("./swagger/swagger");
const { createApolloServer } = require("./graphql");
const { notFound, errorHandler } = require("./middlewares/errorMiddleware");

const createApp = async () => {
  const app = express();

  app.use(helmet());
  app.use(cors());
  app.use(express.json());
  app.use(morgan("dev"));

  const limiter = rateLimit({
    windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS || 15 * 60 * 1000),
    max: Number(process.env.RATE_LIMIT_MAX || 200),
    standardHeaders: true,
    legacyHeaders: false,
  });

  app.use(limiter);

  app.get("/", (req, res) => {
    res.json({
      status: "success",
      message: "E-Commerce REST + GraphQL API is running",
      docs: "/api-docs",
      graphql: "/graphql",
    });
  });

  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  app.use("/api", routes);

  const { apolloServer, middleware } = await createApolloServer();
  app.locals.apolloServer = apolloServer;
  app.use("/graphql", express.json(), middleware);

  app.use(notFound);
  app.use(errorHandler);

  return app;
};

module.exports = createApp;
