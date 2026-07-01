import "dotenv/config";
import app from "./src/app.ts";
import config from "./src/config/index.ts";

const bootstrap = async (): Promise<void> => {
  app.listen(config.server.port, () => {
    console.log(
      `[${config.env}] Server running on http://localhost:${config.server.port}`,
    );
  });
};

bootstrap();
