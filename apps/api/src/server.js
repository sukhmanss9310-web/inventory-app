import { connectDatabase } from "./config/database.js";
import { env } from "./config/env.js";
import { app } from "./app.js";

const startServer = async () => {
  try {
    await connectDatabase();

    const PORT = env.port || 5001;

    app.listen(PORT, "0.0.0.0", () => {
      console.log(`API running on port ${PORT}`);
    });

  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();