// server.ts
import "dotenv/config";
import app from "./src/app.ts";
import { connectDB } from "./src/config/database.ts";
import config from "./src/config/index.ts";

async function bootstrap(): Promise<void> {
  await connectDB(); // connect to DB first, then start server
  app.listen(config.server.port, () => {
    console.log(
      `[${config.env}] Server running on http://localhost:${config.server.port}`,
    );
  });
}

bootstrap();
