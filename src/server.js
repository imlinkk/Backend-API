require("dotenv").config();
const connectDB = require("./config/db");
const createApp = require("./app");

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();
    const app = await createApp();

    const server = app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
      console.log(`Swagger docs: http://localhost:${PORT}/api-docs`);
      console.log(`GraphQL endpoint: http://localhost:${PORT}/graphql`);
    });

    const shutdown = async () => {
      server.close(async () => {
        try {
          if (app.locals.apolloServer) {
            await app.locals.apolloServer.stop();
          }
        } catch (error) {
          console.error("Apollo shutdown error:", error.message);
        } finally {
          try {
            const mongoose = require("mongoose");
            await mongoose.connection.close();
          } finally {
            process.exit(0);
          }
        }
      });
    };

    process.on("SIGINT", shutdown);
    process.on("SIGTERM", shutdown);
  } catch (error) {
    console.error("Failed to start server:", error.message);
    process.exit(1);
  }
};

startServer();
